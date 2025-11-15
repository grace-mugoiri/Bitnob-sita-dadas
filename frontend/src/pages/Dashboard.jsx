import React, { useState } from 'react';
import { Package, Clock, Shield, Truck, MapPin, RefreshCw, Play, CheckCircle } from 'lucide-react';
import { useDeliveryTracking } from '../hooks/useDeliveryTracking';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const {
    orders,
    driverLocations,
    isConnected,
    error,
    trackOrder,
    updateOrderStatus,
    simulateDelivery,
    refreshOrders,
    confirmDelivery
  } = useDeliveryTracking();

  const [selectedOrder, setSelectedOrder] = useState(null);

  // Map backend statuses to your frontend statuses
  const mapBackendStatus = (backendStatus) => {
    const statusMap = {
      'pending': { status: 'pending', text: 'Pending', delivery: 'Processing' },
      'confirmed': { status: 'escrow', text: 'In Escrow', delivery: 'Confirmed' },
      'preparing': { status: 'pending', text: 'Preparing', delivery: 'In Progress' },
      'ready': { status: 'not-arrived', text: 'Ready for Pickup', delivery: 'Ready' },
      'picked_up': { status: 'delivery', text: 'Picked Up', delivery: 'In Transit' },
      'in_transit': { status: 'delivery', text: 'Out for Delivery', delivery: 'Arriving Soon' },
      'delivered': { status: 'delivered', text: 'Delivered', delivery: 'Completed' },
      'cancelled': { status: 'cancelled', text: 'Cancelled', delivery: 'Cancelled' }
    };
    return statusMap[backendStatus] || statusMap['pending'];
  };

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
      case 'delivered':
        return <CheckCircle className="status-icon delivered" />;
      default:
        return <Package className="status-icon" />;
    }
  };

  const handleTrackOrder = (orderId) => {
    trackOrder(orderId);
    setSelectedOrder(orderId);
  };

  const handleSimulateDelivery = (orderId) => {
    simulateDelivery(orderId);
  };

  const handleConfirmDelivery = async (orderId) => {
    if (window.confirm('Confirm that you have received the delivery?')) {
      await confirmDelivery(orderId);
    }
  };

  const getDriverLocation = (order) => {
    if (order.driver_id && driverLocations[order.driver_id]) {
      return driverLocations[order.driver_id];
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Monitor and manage your orders in real-time</p>
        </div>
        <div className="header-actions">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnected ? 'Live' : 'Offline'}
          </div>
          <button 
            className="refresh-btn" 
            onClick={refreshOrders}
            disabled={!isConnected}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="orders-grid">
        {orders.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No Active Orders</h3>
            <p>Create a new order to get started</p>
          </div>
        ) : (
          orders.map((order) => {
            const mappedStatus = mapBackendStatus(order.status);
            const driverLoc = getDriverLocation(order);
            const isTracking = selectedOrder === order.id;

            return (
              <div 
                key={order.id} 
                className={`order-card ${mappedStatus.status} ${isTracking ? 'tracking' : ''}`}
              >
                <div className="order-header">
                  <div className="order-icon">
                    {getStatusIcon(mappedStatus.status)}
                  </div>
                  <div className="order-info">
                    <h3>Order {order.id}</h3>
                    <p className="order-amount">
                      {order.amount ? `${order.amount} BTC` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="order-details">
                  {order.recipientName && (
                    <div className="detail-row">
                      <span className="detail-label">Customer:</span>
                      <span className="detail-value">{order.recipientName}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${mappedStatus.status}`}>
                      {mappedStatus.text}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Delivery:</span>
                    <span className="detail-value">{mappedStatus.delivery}</span>
                  </div>
                  
                  {order.riderName && (
                    <div className="detail-row">
                      <span className="detail-label">Driver:</span>
                      <span className="detail-value driver-badge">
                        <Truck size={14} />
                        {order.riderName}
                      </span>
                    </div>
                  )}

                  {driverLoc && (
                    <div className="driver-location">
                      <MapPin size={14} />
                      <span>
                        Lat: {driverLoc.lat.toFixed(4)}, 
                        Lng: {driverLoc.lng.toFixed(4)}
                      </span>
                      <span className="location-time">
                        {new Date(driverLoc.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  <button
                    className="track-btn"
                    onClick={() => handleTrackOrder(order.id)}
                    disabled={!isConnected || isTracking}
                  >
                    <MapPin size={14} />
                    {isTracking ? 'Tracking...' : 'Track'}
                  </button>
                  
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      className="simulate-btn"
                      onClick={() => handleSimulateDelivery(order.id)}
                      disabled={!isConnected}
                    >
                      <Play size={14} />
                      Simulate
                    </button>
                  )}

                  {order.status === 'in_transit' && (
                    <button
                      className="confirm-btn"
                      onClick={() => handleConfirmDelivery(order.id)}
                      disabled={!isConnected}
                    >
                      <CheckCircle size={14} />
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard;