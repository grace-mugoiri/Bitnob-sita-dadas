import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/Layout.css';
import '../styles/RaysBackground.css';

const Layout = () => {
  return (
    <div className="layout">
      <div className="rays-background-light"></div>
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
