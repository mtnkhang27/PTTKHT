// components/Payment.jsx
import React, { useState } from 'react';
import '../styles/Payment.css';

function Payment() {
  const [registrationId, setRegistrationId] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isUnit, setIsUnit] = useState(false);
  const [unitPaymentDetails, setUnitPaymentDetails] = useState({
    totalFee: 0,
    discount: 0,
    finalFee: 0
  });

  const handleCheckPayment = () => {
    // Mock data - replace with API call
    const paymentData = {
      id: registrationId,
      fee: 100000,
      status: "pending",
      examineesCount: 25
    };
    setPaymentInfo(paymentData);

    if (paymentData.examineesCount > 20) {
      setIsUnit(true);
      setUnitPaymentDetails({
        totalFee: paymentData.fee * paymentData.examineesCount,
        discount: paymentData.fee * paymentData.examineesCount * 0.1,
        finalFee: paymentData.fee * paymentData.examineesCount * 0.9
      })
    }
  };

  const handlePayment = () => {
    // Mock payment success
    setPaymentStatus('Thanh toán thành công');
  };

  return (
    <div className="payment-container">
      <h1 className="payment-title">Thanh Toán và Phiếu Dự Thi</h1>
      <div className="payment-input-area">
        <input
          placeholder="Nhập mã phiếu đăng ký"
          value={registrationId}
          onChange={(e) => setRegistrationId(e.target.value)}
          className="payment-input"
        />
        <button onClick={handleCheckPayment} className="payment-button">Kiểm tra</button>
      </div>

      {paymentInfo && (
        <div className="payment-info">
          <h2 className="payment-info-title">Thông tin thanh toán</h2>
          <p>Mã phiếu đăng ký: {paymentInfo.id}</p>
          <p>Phí: {paymentInfo.fee}</p>
          <p>Trạng thái: {paymentInfo.status}</p>

          {isUnit && (
            <div className="unit-details">
              <h3>Ưu đãi đơn vị</h3>
              <p>Tổng phí: {unitPaymentDetails.totalFee}</p>
              <p>Giảm giá: {unitPaymentDetails.discount}</p>
              <p>Phí cuối cùng: {unitPaymentDetails.finalFee}</p>
            </div>
          )}

          {paymentStatus !== 'Thanh toán thành công' ? (
            <button onClick={handlePayment} className="payment-button">Thanh toán</button>
          ) : (
            <div className="payment-success">
              <p>{paymentStatus}</p>
              {/* Phiếu dự thi thông tin */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Payment;