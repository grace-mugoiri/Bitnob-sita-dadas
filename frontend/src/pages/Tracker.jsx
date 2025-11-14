import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Phone, MessageCircle } from 'lucide-react';
import '../styles/Tracker.css';

const Tracker = () => {
  const [riderLocation, setRiderLocation] = useState({
    lat: 0.3,
    lng: 0.5,
  });

  // Simulate real-time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setRiderLocation((prev) => ({
        lat: Math.min(prev.lat + 0.05, 0.9),
        lng: Math.min(prev.lng + 0.03, 0.9),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const orderInfo = {
    orderId: '#12345',
    from: 'Westlands',
    to: 'Kilimani',
    estimatedTime: '15 mins',
    riderName: 'John Doe',
    riderPhone: '+254712345678',
  };

  return (
    <div className="tracker-container">
      <div className="tracker-header">
        <h1>Track Order</h1>
        <p className="subtitle">Real-time delivery tracking</p>
      </div>

      <div className="tracker-content">
        <div className="map-container">
          <div className="map-placeholder">
            <div className="route-line"></div>
            <div className="location-marker start">
              <MapPin size={24} />
              <span className="marker-label">From: {orderInfo.from}</span>
            </div>
            <div
              className="location-marker rider"
              style={{
                top: `${riderLocation.lat * 100}%`,
                left: `${riderLocation.lng * 100}%`,
              }}
            >
              <Navigation size={24} />
              <span className="marker-label">Rider</span>
            </div>
            <div className="location-marker destination">
              <MapPin size={24} />
              <span className="marker-label">To: {orderInfo.to}</span>
            </div>
          </div>
        </div>

        <div className="tracking-info">
          <div className="info-card">
            <h2>Order Details</h2>
            <div className="info-row">
              <span className="info-label">Order ID:</span>
              <span className="info-value">{orderInfo.orderId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">From:</span>
              <span className="info-value">{orderInfo.from}</span>
            </div>
            <div className="info-row">
              <span className="info-label">To:</span>
              <span className="info-value">{orderInfo.to}</span>
            </div>
            <div className="info-row">
              <span className="info-label">
                <Clock size={16} /> ETA:
              </span>
              <span className="info-value highlight">{orderInfo.estimatedTime}</span>
            </div>
          </div>

          <div className="info-card">
            <h2>Rider Information</h2>
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{orderInfo.riderName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{orderInfo.riderPhone}</span>
            </div>

            <div className="contact-buttons">
              <button className="contact-button">
                <Phone size={18} />
                Call Rider
              </button>
              <button className="contact-button">
                <MessageCircle size={18} />
                WhatsApp
              </button>
            </div>
          </div>

          <div className="status-timeline">
            <h2>Delivery Status</h2>
            <div className="timeline">
              <div className="timeline-item completed">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h3>Order Placed</h3>
                  <p>Payment secured in escrow</p>
                </div>
              </div>
              <div className="timeline-item completed">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h3>Picked Up</h3>
                  <p>Rider collected package</p>
                </div>
              </div>
              <div className="timeline-item active">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h3>In Transit</h3>
                  <p>On the way to destination</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h3>Delivered</h3>
                  <p>Package delivered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracker;
