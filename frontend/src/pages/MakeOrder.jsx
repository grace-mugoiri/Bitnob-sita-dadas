import React, { useState } from 'react';
import { Bitcoin, ShoppingCart, MapPin, User, Phone } from 'lucide-react';
import '../styles/MakeOrder.css';

const MakeOrder = () => {
  const [formData, setFormData] = useState({
    amount: '',
    orderDescription: '',
    deliveryAddress: '',
    recipientName: '',
    recipientPhone: '',
    riderName: '',
    riderPhone: '',
    whatsapp: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Payment to Escrow:', formData);
    // Here you'll integrate with Bitnob API
  };

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
              placeholder="0.0000"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="orderDescription">Order ID / Description</label>
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
            Organization / Rider Details
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

        <button type="submit" className="pay-button">
          <Bitcoin size={20} />
          Pay in BTC
        </button>
      </form>
    </div>
  );
};

export default MakeOrder;
