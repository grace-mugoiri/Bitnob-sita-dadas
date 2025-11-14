import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Navigation,
  History,
  Settings,
  Bitcoin,
} from 'lucide-react';
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
          <img width="50" src="/PayPerRoute.png" alt="HoldPay Logo" />
        </div>
        <h2 className="brand-name">HoldPay</h2>
        <p className="brand-tagline">Trusted Delivery Powered by Bitcoin</p>
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
