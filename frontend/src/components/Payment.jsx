import React, { useState } from 'react';
import '../styles/Payment.css';

function Payment() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [registrationId, setRegistrationId] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isUnit, setIsUnit] = useState(false);
  const [unitPaymentDetails, setUnitPaymentDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null);

  const handleCheckPayment = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/payment/check/${registrationId}`);
      const data = await response.json();

      if (response.ok) {
        setPaymentInfo(data);
        setIsUnit(data.isUnit || false);
        setPaymentMethod('');
        setInvoiceCreated(false);
        setInvoiceDetails(null);
        setPaymentStatus('');

        if (data.isUnit) {
          setUnitPaymentDetails({
            totalFee: data.totalFee,
            discount: data.discount,
            finalFee: data.finalFee,
          });
        }
      } else {
        alert(data.error);
        setPaymentInfo(null);
      }
    } catch (err) {
      alert('Lỗi khi kiểm tra thanh toán');
    }
  };

  const handleCreateInvoice = async () => {
    if (!paymentMethod) {
      alert('Vui lòng chọn hình thức thanh toán');
      return;
    }
  
    const totalAmount = isUnit
      ? unitPaymentDetails?.finalFee
      : paymentInfo?.feePerCandidate;
  
    try {
      const response = await fetch(`${apiUrl}/api/payment/create-invoice/${registrationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          registrationId,
          totalAmount  // 👈 gửi thêm trường này
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setInvoiceCreated(true);
        setInvoiceDetails(data.invoice);
      } else {
        alert(data.error || 'Không thể lập hóa đơn');
      }
    } catch (err) {
      alert('Lỗi khi lập hóa đơn');
    }
  };
  

  const handlePayment = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/payment/confirm/${registrationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: paymentMethod }),
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentStatus(data.message || 'Thanh toán thành công');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Lỗi khi xác nhận thanh toán');
    }
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
          <h2>Thông tin thanh toán</h2>
          <p><strong>Mã phiếu:</strong> {paymentInfo.id}</p>
          <p><strong>Trạng thái:</strong> {paymentInfo.status}</p>

          {!isUnit ? (
            <p><strong>Phí thanh toán:</strong> {paymentInfo.feePerCandidate.toLocaleString()} VNĐ</p>
          ) : (
            <div className="unit-details">
              <h3>Ưu đãi đơn vị</h3>
              <p>Tổng phí: {unitPaymentDetails.totalFee.toLocaleString()} VNĐ</p>
              <p>Giảm giá: {unitPaymentDetails.discount.toLocaleString()} VNĐ</p>
              <p><strong>Phí cuối cùng: {unitPaymentDetails.finalFee.toLocaleString()} VNĐ</strong></p>

              <div className="payment-method">
                <label><strong>Hình thức thanh toán:</strong></label><br />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="payment-select"
                >
                  <option value="">-- Chọn hình thức --</option>
                  <option value="cash">Tiền mặt</option>
                  <option value="transfer">Chuyển khoản</option>
                </select>
              </div>

              {!invoiceCreated && (
                <button onClick={handleCreateInvoice} className="payment-button">
                  Lập hóa đơn
                </button>
              )}
            </div>
          )}

          <ul>
            {paymentInfo.lephithiList?.map((fee, index) => (
              <li key={index}>Chứng chỉ {index + 1}: {parseInt(fee).toLocaleString()} VNĐ</li>
            ))}
          </ul>

          {invoiceCreated && invoiceDetails && (
            <div className="invoice-info">
              <p>Mã hóa đơn: <strong>{invoiceDetails.mahoadon}</strong></p>
              <a
                href={invoiceDetails.link}
                target="_blank"
                rel="noopener noreferrer"
                className="payment-link"
              >
                Xem / Tải hóa đơn (PDF)
              </a>
            </div>
          )}

          {(!isUnit || (isUnit && invoiceCreated)) && (
            <button onClick={handlePayment} className="payment-button">
              Xác nhận thanh toán
            </button>
          )}

          {paymentStatus && (
            <div className="payment-success">
              <p>{paymentStatus}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Payment;
