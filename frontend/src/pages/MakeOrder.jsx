import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, User } from 'lucide-react';
import '../styles/MakeOrder.css';

const MakeOrder = () => {
  const [orderInfo, setOrderInfo] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [lnInvoice, setLnInvoice] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  // AUTO GENERATE ORDER ID
  function generateOrderId() {
    return 'ORD-' + Date.now();
  }

  // GENERATE ISO EXPIRY TIME (30 minutes)
  function getExpiryTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString();
  }

  // COUNTDOWN LOGIC
  useEffect(() => {
    if (!expiryTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiryTime).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setShowQR(false);
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  // HANDLE FORM SUBMISSION → THEN SHOW SUMMARY SCREEN
  function handleOrder(formData) {
    const data = {
      amount: formData.get('amount'),
      orderDesc: formData.get('orderDescription'),
      deliveryAddress: formData.get('deliveryAddress'),
      recipientName: formData.get('recipientName'),
      recipientPhone: formData.get('recipientPhone'),
      riderName: formData.get('riderName'),
      riderPhone: formData.get('riderPhone'),

      email: formData.get('email'),

      orderId: generateOrderId(),
    };

    setOrderInfo(data);
    setShowSummary(true); // Show summary card
  }

  // CONFIRM ORDER → GENERATE INVOICE
  async function confirmAndPay() {
    const expiresAt = getExpiryTime();
    setExpiryTime(expiresAt);

    try {
      const res = await axios.post('http://localhost:3000/create-invoice', {
        satoshis: parseInt(orderInfo.amount),
        customerEmail: orderInfo.email,
        description: `${orderInfo.orderId} - ${orderInfo.orderDesc}`,
        expiresAt,
      });

      setLnInvoice(res.data.bolt11);
      setQrCode(res.data.qrImage);
      setShowQR(true);
      setShowSummary(false);
    } catch (err) {
      console.error(err);
    }
  }

  const shortBolt11 = lnInvoice
    ? lnInvoice.slice(0, 20) + '...' + lnInvoice.slice(-10)
    : '';

  return (
    <>
      {/* ------------------ QR POPUP MODAL ------------------ */}
      {showQR && (
        <div className="qr-modal-overlay">
          <div className="qr-modal-content">
            <h2>Scan to Pay</h2>

            <img src={qrCode} alt="QR" className="qr-image" />

            <p className="bolt11-text">{shortBolt11}</p>

            <p className="expiry-countdown">
              Expires in: <strong>{timeLeft}</strong>
            </p>

            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(lnInvoice);
                alert('Invoice copied!');
              }}
            >
              Copy Invoice
            </button>

            <button
              className="close-modal-btn"
              onClick={() => setShowQR(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ------------------ ORDER SUMMARY SCREEN ------------------ */}
      {showSummary && (
        <div className="summary-overlay">
          <div className="summary-card">
            <h2>Order Summary</h2>

            <p>
              <strong>Order ID:</strong> {orderInfo.orderId}
            </p>
            <p>
              <strong>Amount (Sats):</strong> {orderInfo.amount}
            </p>
            <p>
              <strong>Description:</strong> {orderInfo.orderDesc}
            </p>
            <p>
              <strong>Delivery Address:</strong> {orderInfo.deliveryAddress}
            </p>
            <p>
              <strong>Recipient:</strong> {orderInfo.recipientName}
            </p>
            <p>
              <strong>Recipient Phone:</strong> {orderInfo.recipientPhone}
            </p>
            <p>
              <strong>Email:</strong> {orderInfo.email}
            </p>

            <div className="summary-btns">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowSummary(false);
                  setLnInvoice(null);
                  setQrCode(null);
                  setShowQR(false);
                  setExpiryTime(null);
                }}
              >
                Edit Order
              </button>

              <button className="confirm-btn" onClick={confirmAndPay}>
                Confirm & Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ MAIN FORM ------------------ */}
      <div className="make-order-container">
        <div className="make-order-header">
          <h1>Make Order</h1>
          <p className="subtitle">
            Setup your order and pay securely with Lightning
          </p>
        </div>

        <form action={handleOrder} className="order-form">
          <div className="form-section">
            <h2>Payment to Escrow</h2>

            <div className="form-group">
              <label>Amount (Sats)</label>
              <input type="number" name="amount" required />
            </div>

            <div className="form-group">
              <label>Order Description</label>
              <input type="text" name="orderDescription" required />
            </div>

            <div className="form-group">
              <label>Your Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h2>
              <MapPin size={20} /> Delivery Info
            </h2>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea name="deliveryAddress" rows="3" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Recipient Name</label>
                <input name="recipientName" required />
              </div>

              <div className="form-group">
                <label>Recipient Phone</label>
                <input name="recipientPhone" required />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>
              <User size={20} /> Rider Details
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label>Rider Name</label>
                <input name="riderName" />
              </div>

              <div className="form-group">
                <label>Rider Phone</label>
                <input name="riderPhone" />
              </div>
            </div>
          </div>

          <button type="submit" className="pay-button">
            Continue to Summary
          </button>
        </form>
      </div>
    </>
  );
};

export default MakeOrder;
