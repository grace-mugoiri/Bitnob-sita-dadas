import { useState } from 'react';

import { ShoppingCart, MapPin, User, Phone } from 'lucide-react';

import '../styles/MakeOrder.css';

const MakeOrder = () => {
  const [formData, setFormData] = useState({});

  const [qrCode, setQrcode] = useState(null);
  const [lnaddress, setLnaddress] = useState(null);
  const shortBolt11 = lnaddress
    ? lnaddress.slice(0, 20) + '...' + lnaddress.slice(-10)
    : '';

  function handleOrder(formData) {
    const amount = formData.get('amount');
    const orderDesc = formData.get('orderDesc');
    const deliveryAddress = formData.get('deliveryAddress');
    const recipientName = formData.get('recipientName');
    const recipientPhone = formData.get('recipientPhone');
    const riderName = formData.get('riderName');
    const riderPhone = formData.get('riderPhone');
    const whatsapp = formData.get('whatsapp');

    const data = {
      amount,
      orderDesc,
      deliveryAddress,
      recipientName,
      recipientPhone,
      riderName,
      riderPhone,
      whatsapp,
    };
    setFormData(data);
  }

  async function handleSubmit() {
    try {
      const res = await axios.post('http://localhost:3000/create-invoice', {
        satoshis: parseInt(amount),
        customerEmail: 'lynn@gmail.com',
        description: 'Payment to Escrow',
        expiresAt: '2025-12-01T12:00:00Z',
      });
      setLnaddress(res.data.bolt11);
      setQrcode(res.data.qrImage);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="make-order-container">
      <div className="make-order-header">
        <h1>Make Order</h1>
        <p className="subtitle">
          Setup your order and pay securely with Lightning
        </p>
      </div>

      <form action={handleOrder} className="order-form">
        <div className="form-section">
          <h2>
            {/* <Lightning size={20} /> */}
            Payment to Escrow
          </h2>

          <div className="form-group">
            <label htmlFor="amount">Amount (Sats)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              placeholder="0.0000 Sats"
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="riderPhone">Rider Phone</label>
              <input
                type="tel"
                id="riderPhone"
                name="riderPhone"
                placeholder="+254..."
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
            />
          </div>
        </div>

        <button type="submit" className="pay-button">
          {/* <Lightning size={20} /> */}
          Pay in Sats
        </button>
      </form>
    </div>
  );
};

export default MakeOrder;
