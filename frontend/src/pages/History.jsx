import { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Package } from 'lucide-react';
import '../styles/History.css';

const History = () => {
  const [filter, setFilter] = useState('all');

  const orders = [
    {
      id: '#12340',
      date: 'Feb 18',
      amount: '0.0025 BTC',
      status: 'completed',
      from: 'Westlands',
      to: 'Kilimani',
    },
    {
      id: '#12341',
      date: 'Feb 17',
      amount: '0.0032 BTC',
      status: 'completed',
      from: 'CBD',
      to: 'Karen',
    },
    {
      id: '#12342',
      date: 'Feb 16',
      amount: '0.0018 BTC',
      status: 'uncompleted',
      from: 'Parklands',
      to: 'Upperhill',
      reason: 'Wrong product delivered',
    },
    {
      id: '#12343',
      date: 'Feb 15',
      amount: '0.0041 BTC',
      status: 'completed',
      from: 'Ngong Road',
      to: 'Lavington',
    },
  ];

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    uncompleted: orders.filter((o) => o.status === 'uncompleted').length,
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <div>
          <h1>Order History</h1>
          <p className="subtitle">View all your past orders and transactions</p>
        </div>
        <div className="stats-cards">
          <div className="stat-card">
            <Package className="stat-icon" />
            <div>
              <p className="stat-value">{stats.total}</p>
              <p className="stat-label">Total Orders</p>
            </div>
          </div>
          <div className="stat-card success">
            <CheckCircle className="stat-icon" />
            <div>
              <p className="stat-value">{stats.completed}</p>
              <p className="stat-label">Completed</p>
            </div>
          </div>
          <div className="stat-card error">
            <XCircle className="stat-icon" />
            <div>
              <p className="stat-value">{stats.uncompleted}</p>
              <p className="stat-label">Uncompleted</p>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Orders
        </button>
        <button
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button
          className={`filter-tab ${filter === 'uncompleted' ? 'active' : ''}`}
          onClick={() => setFilter('uncompleted')}
        >
          Uncompleted
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.map((order) => (
          <div key={order.id} className={`history-card ${order.status}`}>
            <div className="history-card-header">
              <div className="order-id-section">
                <h3>{order.id}</h3>
                <div className="date-badge">
                  <Calendar size={14} />
                  {order.date}
                </div>
              </div>
              <div className={`status-indicator ${order.status}`}>
                {order.status === 'completed' ? (
                  <>
                    <CheckCircle size={20} />
                    Completed
                  </>
                ) : (
                  <>
                    <XCircle size={20} />
                    Uncompleted
                  </>
                )}
              </div>
            </div>

            <div className="history-card-body">
              <div className="route-info">
                <div className="route-point">
                  <span className="route-label">From</span>
                  <span className="route-value">{order.from}</span>
                </div>
                <div className="route-arrow">→</div>
                <div className="route-point">
                  <span className="route-label">To</span>
                  <span className="route-value">{order.to}</span>
                </div>
              </div>

              <div className="amount-section">
                <span className="amount-label">Amount</span>
                <span className="amount-value">{order.amount}</span>
              </div>

              {order.reason && (
                <div className="reason-section">
                  <span className="reason-label">Reason:</span>
                  <span className="reason-text">{order.reason}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
