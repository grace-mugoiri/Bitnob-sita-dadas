# Bitcoin Escrow Delivery API Documentation

Base URL: `http://localhost:5000`

## Order Management Endpoints

### 1. Create Order
**POST** `/api/orders`

Create a new order and generate Bitnob payment invoice.

**Request Body:**
```json
{
  "amount_btc": "0.0025",
  "payment_method": "lightning",
  "order_description": "Laptop delivery",
  "delivery_address": "Kilimani, Nairobi",
  "recipient_name": "John Doe",
  "recipient_phone": "+254712345678",
  "buyer_email": "buyer@example.com",
  "rider_name": "Jane Rider",
  "rider_phone": "+254700000000"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "#1731590400",
  "payment_url": "https://pay.bitnob.com/inv_xyz",
  "lightning_invoice": "lnbc500u1p...",
  "invoice_id": "inv_xyz123"
}
```

### 2. Get Order Details
**GET** `/api/orders/<order_id>`

**Response:**
```json
{
  "success": true,
  "order": {
    "order_id": "#12345",
    "status": "in_escrow",
    "amount_btc": "0.0025",
    "description": "Laptop delivery",
    "delivery_address": "Kilimani, Nairobi",
    "rider_location": {
      "lat": -1.286389,
      "lng": 36.817223,
      "timestamp": "2025-11-14T10:15:00Z"
    }
  }
}
```

### 3. Get All Orders
**GET** `/api/orders?status=in_escrow&user_id=1`

**Query Parameters:**
- `status` (optional): Filter by order status
- `user_id` (optional): Filter by buyer ID

**Response:**
```json
{
  "success": true,
  "orders": [...]
}
```

### 4. Update Order Status
**PATCH** `/api/orders/<order_id>/status`

**Request Body:**
```json
{
  "status": "picked_up"
}
```

## Escrow Management Endpoints

### 5. Confirm Delivery (Release Escrow)
**POST** `/api/orders/<order_id>/confirm-delivery`

Buyer confirms delivery, releases payment to seller.

**Request Body:**
```json
{
  "confirmed_by": "buyer",
  "rating": 5,
  "feedback": "Great service!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment released to seller",
  "txid": "a1b2c3...",
  "order": {...}
}
```

### 6. Report Issue (Start Dispute)
**POST** `/api/orders/<order_id>/report-issue`

**Request Body:**
```json
{
  "issue_type": "wrong_product",
  "description": "Received iPhone 13 instead of iPhone 14",
  "evidence_urls": ["https://imgur.com/photo1.jpg"]
}
```

**Response:**
```json
{
  "success": true,
  "dispute_id": "dispute_1731590400",
  "status": "under_review",
  "escrow_frozen": true
}
```

### 7. Resolve Dispute (Admin Only)
**POST** `/api/disputes/<dispute_id>/resolve`

**Request Body:**
```json
{
  "resolution": "refund_buyer",
  "admin_notes": "Evidence shows wrong product"
}
```

**Response:**
```json
{
  "success": true,
  "action": "refund_buyer",
  "txid": "xyz789...",
  "dispute": {...}
}
```

### 8. Get All Disputes (Admin)
**GET** `/api/admin/disputes?status=under_review`

### 9. Get Platform Stats (Admin)
**GET** `/api/admin/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_orders": 1250,
    "total_volume_btc": "2.5",
    "escrow_balance": "0.15",
    "active_deliveries": 8,
    "disputes": 2
  }
}
```

## Webhook Endpoints

### 10. Payment Confirmed Webhook
**POST** `/webhook/payment-confirmed`

Called by Bitnob when payment is confirmed.

**Bitnob Payload:**
```json
{
  "event": "invoice.paid",
  "data": {
    "invoice_id": "inv_xyz123",
    "status": "paid",
    "metadata": {
      "order_id": "#12345"
    }
  }
}
```

### 11. Payment Expired Webhook
**POST** `/webhook/payment-expired`

## WebSocket Events

### Connect to WebSocket
```javascript
const socket = io('http://localhost:5000');
```

### Client → Server Events

#### Join Order Room
```javascript
socket.emit('join_order', {
  order_id: '#12345'
});
```

#### Rider Location Update
```javascript
socket.emit('rider_location_update', {
  order_id: '#12345',
  latitude: -1.286389,
  longitude: 36.817223,
  rider_id: 'rider_001'
});
```

#### Order Status Change
```javascript
socket.emit('order_status_change', {
  order_id: '#12345',
  status: 'picked_up'
});
```

### Server → Client Events

#### Connection Response
```javascript
socket.on('connection_response', (data) => {
  console.log(data); // { data: 'Connected to server' }
});
```

#### Location Updated
```javascript
socket.on('location_updated', (data) => {
  // {
  //   order_id: '#12345',
  //   location: { lat: -1.286389, lng: 36.817223 },
  //   timestamp: '2025-11-14T10:15:00Z'
  // }
});
```

#### Status Updated
```javascript
socket.on('status_updated', (data) => {
  // { order_id: '#12345', status: 'picked_up', timestamp: '...' }
});
```

#### Escrow Updated
```javascript
socket.on('escrow_updated', (data) => {
  // { order_id: '#12345', status: 'in_escrow', message: '...' }
});
```

#### Payment Released
```javascript
socket.on('payment_released', (data) => {
  // { order_id: '#12345', message: 'Payment released to seller' }
});
```

#### Refund Processed
```javascript
socket.on('refund_processed', (data) => {
  // { order_id: '#12345', message: 'Order refunded to buyer' }
});
```

## Order Status Flow

1. `pending` - Order created
2. `awaiting_payment` - Invoice generated
3. `in_escrow` - Payment confirmed, held in escrow
4. `picked_up` - Rider picked up package
5. `in_transit` - Package in transit
6. `delivered` - Package delivered
7. `completed` - Payment released to seller
8. `disputed` - Issue reported, escrow frozen
9. `refunded` - Payment refunded to buyer
10. `cancelled` - Order cancelled

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
