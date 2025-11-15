import React, { useState } from 'react';
import { Bitcoin, ShoppingCart, MapPin, User, Phone, Loader, CheckCircle, Copy } from 'lucide-react';
import { useDeliveryTracking } from '../hooks/useDeliveryTracking';
import '../styles/MakeOrder.css';

const MakeOrder = () => {
  const { createOrder } = useDeliveryTracking();
  
  const [formData, setFormData] = useState({
    amount: '',
    orderDescription: '',
    deliveryAddress: '',
    recipientName: '',
    recipientPhone: '',
    riderName: '',
    riderPhone: '',
    whatsapp: '',
    customer_email: 'user@example.com'
  });

  const [loading, setLoading] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [orderCreated, setOrderCreated] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createOrder(formData);
      
      if (result.success) {
        setOrderCreated(result.order);
        setPaymentInvoice(result.payment_invoice);
      } else {
        alert('Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleNewOrder = () => {
    setOrderCreated(null);
    setPaymentInvoice(null);
    setFormData({
      amount: '',
      orderDescription: '',
      deliveryAddress: '',
      recipientName: '',
      recipientPhone: '',
      riderName: '',
      riderPhone: '',
      whatsapp: '',
      customer_email: 'user@example.com'
    });
  };

  if (orderCreated) {
    return (
      <div className="make-order-container">
        <div className="payment-success">
          <div className="success-icon">
            <CheckCircle size={64} />
          </div>
          <h1>Order Created Successfully!</h1>
          <p className="order-id">Order ID: {orderCreated.id}</p>

          <div className="payment-details-card">
            <h2>
              <Bitcoin size={24} />
              Payment Details
            </h2>

            <div className="payment-info">
              <div className="info-row">
                <span className="info-label">Amount:</span>
                <span className="info-value">{formData.amount} BTC</span>
              </div>

              {paymentInvoice?.data?.lightningInvoice && (
                <div className="invoice-section">
                  <label>Lightning Invoice</label>
                  <div className="copy-box">
                    <textarea
                      readOnly
                      value={paymentInvoice.data.lightningInvoice.paymentRequest}
                      rows="4"
                    />
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(paymentInvoice.data.lightningInvoice.paymentRequest)}
                    >
                      <Copy size={16} />
                      Copy
                    </button>
                  </div>
                  <p className="hint">Use this invoice to pay with Lightning Network</p>
                </div>
              )}

              {paymentInvoice?.data?.address && (
                <div className="address-section">
                  <label>Bitcoin Address</label>
                  <div className="copy-box">
                    <input
                      readOnly
                      value={paymentInvoice.data.address}
                    />
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(paymentInvoice.data.address)}
                    >
                      <Copy size={16} />
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {!paymentInvoice && (
                <div className="payment-note" style={{
                  background: '#fef3c7',
                  borderLeft: '4px solid #f59e0b',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginTop: '1rem'
                }}>
                  <p style={{ color: '#92400e', margin: 0 }}>
                    <strong>Note:</strong> Payment invoice generation is temporarily unavailable.
                    Your order has been created successfully. Please contact support for payment instructions.
                  </p>
                </div>
              )}
            </div>

            <div className="payment-instructions">
              <h3>Next Steps:</h3>
              <ol>
                {paymentInvoice ? (
                  <>
                    <li>Copy the Lightning Invoice or Bitcoin Address</li>
                    <li>Open your Bitcoin wallet</li>
                    <li>Send payment to complete the order</li>
                    <li>Once paid, your order will be confirmed automatically</li>
                  </>
                ) : (
                  <>
                    <li>Your order has been created with ID: {orderCreated.id}</li>
                    <li>Track your order status in the Dashboard</li>
                    <li>Contact support for payment instructions</li>
                  </>
                )}
              </ol>
            </div>

            <div className="action-buttons">
              <button
                className="dashboard-btn"
                onClick={() => window.location.href = '/'}
              >
                Go to Dashboard
              </button>
              <button
                className="new-order-btn"
                onClick={handleNewOrder}
              >
                Create Another Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="make-order-container">
      <div className="make-order-header">
        <div className="header-icon">
          <ShoppingCart size={32} />
        </div>
        <h1>Make Order</h1>
        <p className="subtitle">Setup your order and pay securely with Bitcoin</p>
      </div>

      <form className="order-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>
            <Bitcoin size={20} />
            Payment to Escrow
          </h2>

          <div className="form-group">
            <label htmlFor="amount">Amount (BTC)</label>
            <input
              type="text"
              id="amount"
              name="amount"
              placeholder="0.0001"
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <span className="hint">Minimum: 0.0001 BTC</span>
          </div>

          <div className="form-group">
            <label htmlFor="orderDescription">Order Description</label>
            <input
              type="text"
              id="orderDescription"
              name="orderDescription"
              placeholder="e.g., Electronics - Laptop"
              value={formData.orderDescription}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customer_email">Email (for invoice)</label>
            <input
              type="email"
              id="customer_email"
              name="customer_email"
              placeholder="your@email.com"
              value={formData.customer_email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>
            <MapPin size={20} />
            Delivery Info
          </h2>

          <div className="form-group">
            <label htmlFor="deliveryAddress">Delivery Address</label>
            <textarea
              id="deliveryAddress"
              name="deliveryAddress"
              placeholder="Enter full delivery address"
              value={formData.deliveryAddress}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="recipientName">Recipient Name</label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                placeholder="Full name"
                value={formData.recipientName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipientPhone">Recipient Phone</label>
              <input
                type="tel"
                id="recipientPhone"
                name="recipientPhone"
                placeholder="+254..."
                value={formData.recipientPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>
            <User size={20} />
            Rider Details (Optional)
          </h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="riderName">Rider Name</label>
              <input
                type="text"
                id="riderName"
                name="riderName"
                placeholder="Rider name"
                value={formData.riderName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="riderPhone">Rider Phone</label>
              <input
                type="tel"
                id="riderPhone"
                name="riderPhone"
                placeholder="+254..."
                value={formData.riderPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="whatsapp">WhatsApp</label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              placeholder="+254..."
              value={formData.whatsapp}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="pay-button" disabled={loading}>
          {loading ? (
            <>
              <Loader size={20} className="spinner" />
              Creating Order...
            </>
          ) : (
            <>
              <Bitcoin size={20} />
              Create Order & Pay
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MakeOrder;