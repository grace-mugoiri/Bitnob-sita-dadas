from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from datetime import datetime
import json
import random
import requests
import uuid
from dotenv import load_dotenv
import os

load_dotenv()


app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Bitnob API Configuration
app.config['SECRET_KEY'] = os.getenv("FLASK_SECRET_KEY")
BITNOB_API_KEY = os.getenv("BITNOB_API_KEY")
BITNOB_BASE_URL = os.getenv("BITNOB_BASE_URL")


# In-memory storage (use database in production)
orders = {}
drivers = {}
active_connections = {}

# Order status flow
ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled']

# Nairobi GPS coordinates
NAIROBI_COORDS = {
    'lat': -1.286389,
    'lng': 36.817223
}

# ============= Bitnob API Integration =============

def create_bitnob_invoice(amount_btc, description, customer_email):
    """Create a payment invoice using Bitnob API"""
    url = f"{BITNOB_BASE_URL}/api/v1/wallets/ln/createinvoice"
    headers = {
        'Authorization': f'Bearer {BITNOB_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Convert BTC to satoshis
    amount_sats = int(float(amount_btc) * 100000000)
    
    payload = {
        'amount': amount_sats,
        'description': description,
        'customerEmail': customer_email
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Bitnob API Error: {str(e)}")
        return None

def verify_bitnob_payment(payment_hash):
    """Verify if a payment has been completed"""
    url = f"{BITNOB_BASE_URL}/api/v1/wallets/ln/lookup/{payment_hash}"
    headers = {
        'Authorization': f'Bearer {BITNOB_API_KEY}'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get('status') == 'paid'
    except Exception as e:
        print(f"Payment verification error: {str(e)}")
        return False

# ============= REST API Endpoints =============

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'HoldPay Delivery API'
    })

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new order with Bitnob payment"""
    data = request.json
    order_id = f"#{str(uuid.uuid4())[:8].upper()}"
    
    # Create Bitnob invoice
    bitnob_invoice = create_bitnob_invoice(
        amount_btc=data.get('amount', '0.0001'),
        description=data.get('orderDescription', f'Order {order_id}'),
        customer_email=data.get('customer_email', 'user@example.com')
    )
    
    order = {
        'id': order_id,
        'amount': data.get('amount', '0.0001'),
        'orderDescription': data.get('orderDescription'),
        'deliveryAddress': data.get('deliveryAddress'),
        'recipientName': data.get('recipientName'),
        'recipientPhone': data.get('recipientPhone'),
        'riderName': data.get('riderName'),
        'riderPhone': data.get('riderPhone'),
        'whatsapp': data.get('whatsapp'),
        'status': 'pending',
        'payment_status': 'pending',
        'created_at': datetime.now().isoformat(),
        'delivery_location': {
            'lat': NAIROBI_COORDS['lat'] + random.uniform(-0.05, 0.05),
            'lng': NAIROBI_COORDS['lng'] + random.uniform(-0.05, 0.05)
        },
        'bitnob_invoice': bitnob_invoice if bitnob_invoice else None
    }
    
    orders[order_id] = order
    
    # Broadcast new order to all connected clients
    socketio.emit('new_order', order, namespace='/')
    
    return jsonify({
        'success': True,
        'order': order,
        'payment_invoice': bitnob_invoice
    }), 201

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    """Get order details"""
    order = orders.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify(order)

@app.route('/api/orders', methods=['GET'])
def get_all_orders():
    """Get all orders"""
    return jsonify(list(orders.values()))

@app.route('/api/orders/<order_id>/verify-payment', methods=['POST'])
def verify_payment(order_id):
    """Verify payment for an order"""
    order = orders.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    if not order.get('bitnob_invoice'):
        return jsonify({'error': 'No payment invoice found'}), 400
    
    payment_hash = order['bitnob_invoice'].get('data', {}).get('paymentHash')
    if payment_hash:
        is_paid = verify_bitnob_payment(payment_hash)
        
        if is_paid:
            order['payment_status'] = 'paid'
            order['status'] = 'confirmed'
            
            # Notify clients
            socketio.emit('payment_confirmed', {
                'order_id': order_id,
                'status': 'confirmed',
                'payment_status': 'paid'
            }, namespace='/')
            
            return jsonify({'success': True, 'paid': True, 'order': order})
    
    return jsonify({'success': False, 'paid': False})

@app.route('/api/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Update order status"""
    data = request.json
    new_status = data.get('status')
    
    if new_status not in ORDER_STATUSES:
        return jsonify({'error': 'Invalid status'}), 400
    
    order = orders.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    old_status = order['status']
    order['status'] = new_status
    order['updated_at'] = datetime.now().isoformat()
    
    # Broadcast status update
    socketio.emit('order_status_update', {
        'order_id': order_id,
        'old_status': old_status,
        'new_status': new_status,
        'timestamp': order['updated_at']
    }, namespace='/')
    
    # Notify specific order room
    socketio.emit('status_changed', order, room=order_id)
    
    return jsonify(order)

@app.route('/api/drivers/<driver_id>/location', methods=['POST'])
def update_driver_location(driver_id):
    """Update driver's GPS location"""
    data = request.json
    
    location = {
        'driver_id': driver_id,
        'lat': data.get('lat'),
        'lng': data.get('lng'),
        'heading': data.get('heading', 0),
        'speed': data.get('speed', 0),
        'timestamp': datetime.now().isoformat()
    }
    
    drivers[driver_id] = location
    
    # Get driver's assigned order
    order_id = data.get('order_id')
    
    # Broadcast location update to order room
    if order_id:
        socketio.emit('driver_location_update', location, room=order_id)
    
    # Broadcast to all tracking this driver
    socketio.emit('driver_location', location, namespace='/')
    
    return jsonify(location)

@app.route('/api/drivers/<driver_id>/location', methods=['GET'])
def get_driver_location(driver_id):
    """Get driver's current location"""
    location = drivers.get(driver_id)
    if not location:
        return jsonify({'error': 'Driver not found'}), 404
    return jsonify(location)

@app.route('/api/orders/<order_id>/assign-driver', methods=['POST'])
def assign_driver(order_id):
    """Assign a driver to an order"""
    data = request.json
    driver_id = data.get('driver_id')
    driver_name = data.get('driver_name', 'John Doe')
    driver_phone = data.get('driver_phone', '+254712345678')
    
    order = orders.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    order['driver_id'] = driver_id
    order['riderName'] = driver_name
    order['riderPhone'] = driver_phone
    order['status'] = 'confirmed'
    
    # Initialize driver location near restaurant
    if driver_id not in drivers:
        drivers[driver_id] = {
            'driver_id': driver_id,
            'name': driver_name,
            'phone': driver_phone,
            'lat': NAIROBI_COORDS['lat'],
            'lng': NAIROBI_COORDS['lng'],
            'heading': 0,
            'speed': 0,
            'timestamp': datetime.now().isoformat()
        }
    
    # Notify about driver assignment
    socketio.emit('driver_assigned', {
        'order_id': order_id,
        'driver_id': driver_id,
        'driver_name': driver_name,
        'driver_phone': driver_phone,
        'driver_location': drivers[driver_id]
    }, room=order_id)
    
    return jsonify(order)

# ============= WebSocket Events =============

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    client_id = request.sid
    active_connections[client_id] = {
        'connected_at': datetime.now().isoformat()
    }
    print(f'Client connected: {client_id}')
    emit('connected', {
        'client_id': client_id,
        'message': 'Connected to HoldPay delivery tracking server'
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    client_id = request.sid
    if client_id in active_connections:
        del active_connections[client_id]
    print(f'Client disconnected: {client_id}')

@socketio.on('track_order')
def handle_track_order(data):
    """Subscribe to order tracking updates"""
    order_id = data.get('order_id')
    if order_id in orders:
        join_room(order_id)
        order = orders[order_id]
        
        # Send current order status
        emit('order_data', order)
        
        # Send driver location if assigned
        if 'driver_id' in order and order['driver_id'] in drivers:
            emit('driver_location_update', drivers[order['driver_id']])
        
        print(f'Client {request.sid} tracking order {order_id}')
    else:
        emit('error', {'message': 'Order not found'})

@socketio.on('stop_tracking')
def handle_stop_tracking(data):
    """Unsubscribe from order tracking"""
    order_id = data.get('order_id')
    leave_room(order_id)
    print(f'Client {request.sid} stopped tracking order {order_id}')

@socketio.on('simulate_delivery')
def handle_simulate_delivery(data):
    """Simulate a delivery journey (for testing)"""
    order_id = data.get('order_id')
    order = orders.get(order_id)
    
    if not order:
        emit('error', {'message': 'Order not found'})
        return
    
    # Assign driver if not already assigned
    driver_id = order.get('driver_id', f'DRIVER-{random.randint(1000, 9999)}')
    if 'driver_id' not in order:
        order['driver_id'] = driver_id
        order['riderName'] = 'John Doe'
        order['riderPhone'] = '+254712345678'
    
    # Get destination
    dest_lat = order['delivery_location']['lat']
    dest_lng = order['delivery_location']['lng']
    
    # Start from restaurant
    current_lat = NAIROBI_COORDS['lat']
    current_lng = NAIROBI_COORDS['lng']
    
    # Calculate steps
    steps = 15
    lat_step = (dest_lat - current_lat) / steps
    lng_step = (dest_lng - current_lng) / steps
    
    import threading
    import time
    
    def simulate_movement():
        nonlocal current_lat, current_lng
        
        for i in range(steps + 1):
            location = {
                'driver_id': driver_id,
                'lat': current_lat,
                'lng': current_lng,
                'heading': 45 + random.uniform(-10, 10),
                'speed': 30 + random.uniform(-5, 10),
                'timestamp': datetime.now().isoformat()
            }
            
            drivers[driver_id] = location
            socketio.emit('driver_location_update', location, room=order_id)
            
            current_lat += lat_step
            current_lng += lng_step
            
            # Update status during journey
            if i == 0:
                order['status'] = 'picked_up'
                socketio.emit('status_changed', order, room=order_id)
            elif i == steps // 2:
                order['status'] = 'in_transit'
                socketio.emit('status_changed', order, room=order_id)
            elif i == steps:
                order['status'] = 'delivered'
                socketio.emit('status_changed', order, room=order_id)
            
            time.sleep(2)  # Update every 2 seconds
    
    thread = threading.Thread(target=simulate_movement)
    thread.daemon = True
    thread.start()
    
    emit('simulation_started', {'order_id': order_id, 'driver_id': driver_id})

@socketio.on('get_active_orders')
def handle_get_active_orders():
    """Get all active orders"""
    active = [o for o in orders.values() if o['status'] not in ['delivered', 'cancelled']]
    emit('active_orders', active)

@socketio.on('confirm_delivery')
def handle_confirm_delivery(data):
    """Confirm delivery and release payment from escrow"""
    order_id = data.get('order_id')
    order = orders.get(order_id)
    
    if not order:
        emit('error', {'message': 'Order not found'})
        return
    
    # Update order status
    order['status'] = 'delivered'
    order['delivered_at'] = datetime.now().isoformat()
    order['payment_released'] = True
    
    # Notify all clients
    socketio.emit('delivery_confirmed', {
        'order_id': order_id,
        'status': 'delivered',
        'payment_released': True
    }, room=order_id)
    
    emit('delivery_success', {
        'message': 'Delivery confirmed. Payment released from escrow.',
        'order': order
    })

# ============= Run Server =============

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Starting HoldPay Delivery Tracking Server")
    print("=" * 50)
    print(f"Server URL: http://localhost:5000")
    print(f"WebSocket: ws://localhost:5000")
    print(f"Bitnob Integration: {'✓ Active' if BITNOB_API_KEY else '✗ Not configured'}")
    print("=" * 50)
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)