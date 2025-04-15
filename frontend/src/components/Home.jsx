// components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css'; // Import component-specific CSS

function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">Trung tâm tổ chức thi chứng chỉ ACCI</h1>
      <p className="home-intro">Chào mừng bạn đến với trang web của trung tâm chúng tôi.</p>
      <div className="home-nav">
        <Link to="/register" className="home-nav-link">Đăng ký kiểm tra</Link> |
        <Link to="/payment" className="home-nav-link">Thanh toán và phiếu dự thi</Link> |
        <Link to="/extend-test" className="home-nav-link">Gia hạn thời gian thi</Link> |
        <Link to="/certificate" className="home-nav-link">Cấp chứng chỉ</Link>
      </div>
    </div>
  );
}

export default Home;