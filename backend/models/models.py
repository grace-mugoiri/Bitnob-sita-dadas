from datetime import datetime
from . import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # buyer, seller, rider
    btc_address = db.Column(db.String(255))  # For sellers/riders to receive payments
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    orders_as_buyer = db.relationship('Order', foreign_keys='Order.buyer_id', backref='buyer', lazy=True)
    orders_as_seller = db.relationship('Order', foreign_keys='Order.seller_id', backref='seller', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'user_type': self.user_type,
            'btc_address': self.btc_address,
            'created_at': self.created_at.isoformat()
        }


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), unique=True, nullable=False)

    # Payment details
    invoice_id = db.Column(db.String(100))
    payment_method = db.Column(db.String(20))  # bitcoin or lightning
    amount_btc = db.Column(db.String(20), nullable=False)
    payment_url = db.Column(db.String(500))
    lightning_invoice = db.Column(db.Text)

    # Order details
    description = db.Column(db.Text, nullable=False)
    delivery_address = db.Column(db.Text, nullable=False)
    recipient_name = db.Column(db.String(100), nullable=False)
    recipient_phone = db.Column(db.String(20), nullable=False)

    # Rider details
    rider_name = db.Column(db.String(100))
    rider_phone = db.Column(db.String(20))
    rider_whatsapp = db.Column(db.String(20))

    # Status tracking
    status = db.Column(db.String(50), default='pending')
    # pending, awaiting_payment, in_escrow, picked_up, in_transit, delivered, completed, cancelled, refunded

    # Relationships
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    paid_at = db.Column(db.DateTime)
    picked_up_at = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)

    # Tracking
    locations = db.relationship('LocationUpdate', backref='order', lazy=True, cascade='all, delete-orphan')
    dispute = db.relationship('Dispute', backref='order', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'invoice_id': self.invoice_id,
            'payment_method': self.payment_method,
            'amount_btc': self.amount_btc,
            'description': self.description,
            'delivery_address': self.delivery_address,
            'recipient_name': self.recipient_name,
            'recipient_phone': self.recipient_phone,
            'rider_name': self.rider_name,
            'rider_phone': self.rider_phone,
            'status': self.status,
            'buyer_id': self.buyer_id,
            'seller_id': self.seller_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
        }


class LocationUpdate(db.Model):
    __tablename__ = 'location_updates'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'timestamp': self.timestamp.isoformat()
        }


class Dispute(db.Model):
    __tablename__ = 'disputes'

    id = db.Column(db.Integer, primary_key=True)
    dispute_id = db.Column(db.String(50), unique=True, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)

    issue_type = db.Column(db.String(50), nullable=False)  # wrong_product, not_delivered, damaged, etc
    description = db.Column(db.Text, nullable=False)
    evidence_urls = db.Column(db.Text)  # JSON array of image URLs

    status = db.Column(db.String(50), default='under_review')  # under_review, resolved_refund, resolved_release
    resolution_notes = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'dispute_id': self.dispute_id,
            'order_id': self.order_id,
            'issue_type': self.issue_type,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }
