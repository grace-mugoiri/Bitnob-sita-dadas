from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.models import db
from backend.models.models import Order

webhooks_bp = Blueprint('webhooks', __name__)

@webhooks_bp.route('/webhook/payment-confirmed', methods=['POST'])
def payment_confirmed():
    """
    Bitnob webhook - Payment confirmation
    """
    try:
        data = request.json
        print("Received payment webhook:", data)

        # Extract data from Bitnob webhook
        event = data.get('event')
        invoice_data = data.get('data', {})

        if event == 'invoice.paid':
            invoice_id = invoice_data.get('invoice_id') or invoice_data.get('id')
            metadata = invoice_data.get('metadata', {})
            order_id = metadata.get('order_id')

            # Find order by invoice_id or order_id from metadata
            order = None
            if order_id:
                order = Order.query.filter_by(order_id=order_id).first()
            elif invoice_id:
                order = Order.query.filter_by(invoice_id=invoice_id).first()

            if not order:
                print(f"Order not found for invoice {invoice_id}")
                return jsonify({'status': 'order_not_found'}), 404

            # Update order status to in_escrow
            order.status = 'in_escrow'
            order.paid_at = datetime.utcnow()

            db.session.commit()

            print(f"Order {order.order_id} moved to escrow")

            # TODO: Emit WebSocket event to notify buyer and rider
            # socketio.emit('payment_confirmed', {
            #     'order_id': order.order_id,
            #     'status': 'in_escrow'
            # })

            return jsonify({
                'status': 'success',
                'message': 'Payment confirmed, order in escrow'
            }), 200

        return jsonify({'status': 'event_not_handled'}), 200

    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500


@webhooks_bp.route('/webhook/payment-expired', methods=['POST'])
def payment_expired():
    """
    Bitnob webhook - Payment expired
    """
    try:
        data = request.json
        invoice_id = data.get('data', {}).get('invoice_id')

        order = Order.query.filter_by(invoice_id=invoice_id).first()
        if order and order.status == 'awaiting_payment':
            order.status = 'cancelled'
            db.session.commit()

        return jsonify({'status': 'success'}), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500
