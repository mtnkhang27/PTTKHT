// components/Layout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Layout.css'; // Import component-specific CSS

function Layout({ children }) {
  return (
    <div className="layout-container">
      <header className="layout-header">
        <h1 className="header-title">Trung tâm ACCI</h1>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Trang chủ</Link> |
          <Link to="/register" className="nav-link">Đăng ký</Link> |
          <Link to="/payment" className="nav-link">Thanh toán</Link> |
          <Link to="/extend-test" className="nav-link">Gia hạn</Link> |
          <Link to="/certificate" className="nav-link">Chứng chỉ</Link>
        </nav>
      </header>

      <main className="layout-main">
        {children}
      </main>

      <footer className="layout-footer">
        <p className="footer-text">&copy; 2024 Trung tâm ACCI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Layout;