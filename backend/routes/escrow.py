from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.models import db
from backend.models.models import Order, Dispute, User
from backend.services.bitnob_service import BitnobService

escrow_bp = Blueprint('escrow', __name__)
bitnob = BitnobService()

@escrow_bp.route('/api/orders/<order_id>/confirm-delivery', methods=['POST'])
def confirm_delivery(order_id):
    """
    Buyer confirms delivery - Release payment from escrow to seller
    """
    try:
        data = request.json
        order = Order.query.filter_by(order_id=order_id).first()

        if not order:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404

        if order.status != 'delivered' and order.status != 'in_transit':
            return jsonify({
                'success': False,
                'error': f'Cannot confirm delivery. Order status is {order.status}'
            }), 400

        # Get seller/rider info
        seller = User.query.get(order.seller_id) if order.seller_id else None

        if not seller or not seller.btc_address:
            return jsonify({
                'success': False,
                'error': 'Seller BTC address not found'
            }), 400

        # Release payment to seller
        if order.payment_method == 'lightning':
            # For Lightning, seller provides their invoice
            # In real implementation, seller would provide this when accepting order
            payment_request = data.get('seller_lightning_invoice')
            if not payment_request:
                return jsonify({
                    'success': False,
                    'error': 'Seller Lightning invoice required'
                }), 400

            result = bitnob.send_lightning(payment_request)
        else:
            # Send Bitcoin on-chain
            result = bitnob.send_bitcoin(
                amount_btc=order.amount_btc,
                address=seller.btc_address,
                description=f"Payment for order {order_id}"
            )

        if not result['success']:
            return jsonify({
                'success': False,
                'error': 'Payment release failed',
                'details': result.get('error')
            }), 500

        # Update order status
        order.status = 'completed'
        order.completed_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Payment released to seller',
            'txid': result.get('data', {}).get('data', {}).get('txid'),
            'order': order.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@escrow_bp.route('/api/orders/<order_id>/report-issue', methods=['POST'])
def report_issue(order_id):
    """
    Buyer reports an issue with the order - Start dispute process
    """
    try:
        data = request.json
        order = Order.query.filter_by(order_id=order_id).first()

        if not order:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404

        if order.status == 'completed' or order.status == 'refunded':
            return jsonify({
                'success': False,
                'error': 'Cannot dispute completed or refunded order'
            }), 400

        # Check if dispute already exists
        existing_dispute = Dispute.query.filter_by(order_id=order.id).first()
        if existing_dispute:
            return jsonify({
                'success': False,
                'error': 'Dispute already exists for this order'
            }), 400

        # Create dispute
        dispute_id = f"dispute_{int(datetime.utcnow().timestamp())}"
        new_dispute = Dispute(
            dispute_id=dispute_id,
            order_id=order.id,
            issue_type=data['issue_type'],
            description=data['description'],
            evidence_urls=data.get('evidence_urls', ''),
            status='under_review'
        )

        # Freeze escrow - update order status
        order.status = 'disputed'

        db.session.add(new_dispute)
        db.session.commit()

        return jsonify({
            'success': True,
            'dispute_id': dispute_id,
            'status': 'under_review',
            'escrow_frozen': True
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@escrow_bp.route('/api/disputes/<dispute_id>/resolve', methods=['POST'])
def resolve_dispute(dispute_id):
    """
    Admin resolves dispute - either refund buyer or pay seller
    """
    try:
        data = request.json
        dispute = Dispute.query.filter_by(dispute_id=dispute_id).first()

        if not dispute:
            return jsonify({
                'success': False,
                'error': 'Dispute not found'
            }), 404

        if dispute.status != 'under_review':
            return jsonify({
                'success': False,
                'error': 'Dispute already resolved'
            }), 400

        order = Order.query.get(dispute.order_id)
        resolution = data['resolution']  # 'refund_buyer' or 'pay_seller'

        if resolution == 'refund_buyer':
            # Refund to buyer
            buyer = User.query.get(order.buyer_id)
            if not buyer or not buyer.btc_address:
                return jsonify({
                    'success': False,
                    'error': 'Buyer BTC address not found'
                }), 400

            result = bitnob.send_bitcoin(
                amount_btc=order.amount_btc,
                address=buyer.btc_address,
                description=f"Refund for order {order.order_id}"
            )

            if result['success']:
                order.status = 'refunded'
                dispute.status = 'resolved_refund'
                dispute.resolution_notes = data.get('admin_notes', '')
                dispute.resolved_at = datetime.utcnow()

        elif resolution == 'pay_seller':
            # Pay seller (same as confirm delivery)
            seller = User.query.get(order.seller_id)
            if not seller or not seller.btc_address:
                return jsonify({
                    'success': False,
                    'error': 'Seller BTC address not found'
                }), 400

            result = bitnob.send_bitcoin(
                amount_btc=order.amount_btc,
                address=seller.btc_address,
                description=f"Payment for disputed order {order.order_id}"
            )

            if result['success']:
                order.status = 'completed'
                dispute.status = 'resolved_release'
                dispute.resolution_notes = data.get('admin_notes', '')
                dispute.resolved_at = datetime.utcnow()
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid resolution type'
            }), 400

        if not result['success']:
            return jsonify({
                'success': False,
                'error': 'Payment failed',
                'details': result.get('error')
            }), 500

        db.session.commit()

        return jsonify({
            'success': True,
            'action': resolution,
            'txid': result.get('data', {}).get('data', {}).get('txid'),
            'dispute': dispute.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@escrow_bp.route('/api/admin/disputes', methods=['GET'])
def get_all_disputes():
    """
    Get all disputes (admin only)
    """
    try:
        status = request.args.get('status')

        query = Dispute.query
        if status:
            query = query.filter_by(status=status)

        disputes = query.order_by(Dispute.created_at.desc()).all()

        return jsonify({
            'success': True,
            'disputes': [dispute.to_dict() for dispute in disputes]
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@escrow_bp.route('/api/admin/stats', methods=['GET'])
def get_platform_stats():
    """
    Get platform statistics (admin only)
    """
    try:
        total_orders = Order.query.count()
        active_deliveries = Order.query.filter(
            Order.status.in_(['picked_up', 'in_transit'])
        ).count()
        disputes_count = Dispute.query.filter_by(status='under_review').count()

        # Get wallet balance
        balance_result = bitnob.get_wallet_balance()
        escrow_balance = '0'
        if balance_result['success']:
            escrow_balance = balance_result.get('data', {}).get('data', {}).get('btc', {}).get('available', '0')

        # Calculate total volume
        completed_orders = Order.query.filter_by(status='completed').all()
        total_volume_btc = sum(float(order.amount_btc) for order in completed_orders)

        return jsonify({
            'success': True,
            'stats': {
                'total_orders': total_orders,
                'total_volume_btc': str(total_volume_btc),
                'escrow_balance': escrow_balance,
                'active_deliveries': active_deliveries,
                'disputes': disputes_count
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
