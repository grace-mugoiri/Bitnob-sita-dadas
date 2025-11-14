import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Navigation, History, Settings, Bitcoin } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/make-order', icon: ShoppingCart, label: 'Make Order' },
    { path: '/tracker', icon: Navigation, label: 'Tracker' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <Bitcoin size={32} />
        </div>
        <h2 className="brand-name">Escrow Pay</h2>
        <p className="brand-tagline">Secure Bitcoin Delivery</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <span>U</span>
          </div>
          <div className="user-details">
            <p className="user-name">User Account</p>
            <p className="user-email">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
