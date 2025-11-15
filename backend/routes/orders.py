from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.models import db
from backend.models.models import Order, LocationUpdate
from backend.services.bitnob_service import BitnobService
import os

orders_bp = Blueprint('orders', __name__)
bitnob = BitnobService()

@orders_bp.route('/api/orders', methods=['POST'])
def create_order():
    """
    Create a new order and generate Bitnob payment invoice
    """
    try:
        data = request.json

        # Generate unique order ID
        order_id = f"#{int(datetime.utcnow().timestamp())}"

        # Create order in database
        new_order = Order(
            order_id=order_id,
            payment_method=data.get('payment_method', 'bitcoin'),
            amount_btc=data['amount_btc'],
            description=data['order_description'],
            delivery_address=data['delivery_address'],
            recipient_name=data['recipient_name'],
            recipient_phone=data['recipient_phone'],
            rider_name=data.get('rider_name'),
            rider_phone=data.get('rider_phone'),
            rider_whatsapp=data.get('rider_whatsapp'),
            buyer_id=data.get('buyer_id', 1),  # TODO: Get from auth token
            status='pending'
        )

        # Create payment invoice based on payment method
        callback_url = f"{os.getenv('BACKEND_URL', 'http://localhost:5000')}/webhook/payment-confirmed"

        if new_order.payment_method == 'lightning':
            # Convert BTC to satoshis (1 BTC = 100,000,000 sats)
            amount_sats = int(float(data['amount_btc']) * 100000000)

            result = bitnob.create_lightning_invoice(
                amount_sats=amount_sats,
                description=f"Order {order_id} - {data['order_description']}"
            )

            if result['success']:
                invoice_data = result['data'].get('data', {})
                new_order.lightning_invoice = invoice_data.get('payment_request')
                new_order.invoice_id = invoice_data.get('payment_hash')
        else:
            # Bitcoin invoice
            result = bitnob.create_invoice(
                amount_btc=data['amount_btc'],
                description=f"Order {order_id} - {data['order_description']}",
                customer_email=data.get('buyer_email', 'buyer@example.com'),
                callback_url=callback_url,
                metadata={
                    'order_id': order_id,
                    'delivery_address': data['delivery_address']
                }
            )

            if result['success']:
                invoice_data = result['data'].get('data', {})
                new_order.invoice_id = invoice_data.get('id')
                new_order.payment_url = invoice_data.get('hostedUrl')

        if not result['success']:
            return jsonify({
                'success': False,
                'error': 'Failed to create payment invoice'
            }), 400

        new_order.status = 'awaiting_payment'
        db.session.add(new_order)
        db.session.commit()

        return jsonify({
            'success': True,
            'order_id': order_id,
            'payment_url': new_order.payment_url,
            'lightning_invoice': new_order.lightning_invoice,
            'invoice_id': new_order.invoice_id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@orders_bp.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    """
    Get order details by order_id
    """
    try:
        order = Order.query.filter_by(order_id=order_id).first()

        if not order:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404

        # Get latest location if available
        latest_location = LocationUpdate.query.filter_by(
            order_id=order.id
        ).order_by(LocationUpdate.timestamp.desc()).first()

        order_data = order.to_dict()
        if latest_location:
            order_data['rider_location'] = {
                'lat': latest_location.latitude,
                'lng': latest_location.longitude,
                'timestamp': latest_location.timestamp.isoformat()
            }

        return jsonify({
            'success': True,
            'order': order_data
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@orders_bp.route('/api/orders', methods=['GET'])
def get_orders():
    """
    Get all orders with optional filtering
    """
    try:
        status = request.args.get('status')
        user_id = request.args.get('user_id')

        query = Order.query

        if status:
            query = query.filter_by(status=status)
        if user_id:
            query = query.filter_by(buyer_id=user_id)

        orders = query.order_by(Order.created_at.desc()).all()

        return jsonify({
            'success': True,
            'orders': [order.to_dict() for order in orders]
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@orders_bp.route('/api/orders/<order_id>/status', methods=['PATCH'])
def update_order_status(order_id):
    """
    Update order status
    """
    try:
        data = request.json
        order = Order.query.filter_by(order_id=order_id).first()

        if not order:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404

        new_status = data.get('status')
        if new_status:
            order.status = new_status

            # Update timestamps based on status
            if new_status == 'picked_up':
                order.picked_up_at = datetime.utcnow()
            elif new_status == 'delivered':
                order.delivered_at = datetime.utcnow()
            elif new_status == 'completed':
                order.completed_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'success': True,
            'order': order.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
