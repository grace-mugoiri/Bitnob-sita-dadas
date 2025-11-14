import React from 'react';
import { Package, Clock, Shield, Truck } from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const orders = [
    {
      id: '#12345',
      amount: '0.0025 BTC',
      status: 'not-arrived',
      statusText: 'Not Yet Arrived',
      delivery: 'In Transit',
    },
    {
      id: '#12346',
      amount: '0.0018 BTC',
      status: 'escrow',
      statusText: 'In Escrow',
      delivery: 'Pending',
    },
    {
      id: '#12347',
      amount: '0.0032 BTC',
      status: 'pending',
      statusText: 'Pending',
      delivery: 'Processing',
    },
    {
      id: '#12348',
      amount: '0.0041 BTC',
      status: 'delivery',
      statusText: 'Out for Delivery',
      delivery: 'Arriving Today',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'not-arrived':
        return <Clock className="status-icon" />;
      case 'escrow':
        return <Shield className="status-icon" />;
      case 'pending':
        return <Package className="status-icon" />;
      case 'delivery':
        return <Truck className="status-icon" />;
      default:
        return <Package className="status-icon" />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="subtitle">Monitor and manage your orders</p>
      </div>

      <div className="orders-grid">
        {orders.map((order) => (
          <div key={order.id} className={`order-card ${order.status}`}>
            <div className="order-header">
              <div className="order-icon">
                {getStatusIcon(order.status)}
              </div>
              <div className="order-info">
                <h3>Order {order.id}</h3>
                <p className="order-amount">{order.amount}</p>
              </div>
            </div>
            <div className="order-details">
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${order.status}`}>
                  {order.statusText}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Delivery:</span>
                <span className="detail-value">{order.delivery}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
