import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/Customer.css'; 


function Customer() {
  
  const [tenKhachHang, setTenKhachHang] = useState(''); // TênKháchHàng
  const [email, setEmail] = useState('');             // Email
  const [sdt, setSdt] = useState('');                 // SĐT (Số Điện Thoại)
  const [diaChi, setDiaChi] = useState('');           // ĐịaChỉ

  const location = useLocation(); // Get the current location object
  const registerType = location.state?.registerType || 'unknown'; // Fallback

  // --- Event Handlers ---


  const handleAddCustomerClick = (event) => {
   
    event.preventDefault();

    // Gather the data from the state
    const customerData = {
      name: tenKhachHang,
      email: email,
      phone: sdt,
      address: diaChi,
      registerType: registerType, 
    };

    console.log('Submitting Customer Data:', customerData);

    alert('Khách hàng đã được thêm (Check console for data)!'); // Simple feedback
  };

  // --- JSX Rendering ---
  // Renders the form with input fields and the button

  return (
    // Add the className here
    <div className="customer-form-container">
      <h2>Thêm Khách Hàng Mới</h2>
     
      <div style={{ textAlign: 'center' }}>
        <label className="register-type-label">
          {registerType === 'individual' ? 'Cá nhân' : 'Đơn vị'}
        </label>
      </div>

      <form onSubmit={handleAddCustomerClick}>
       
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="tenKhachHang" style={{ display: 'block', marginBottom: '5px' }}>
            Tên Khách Hàng:
          </label>
          <input
            type="text"
            id="tenKhachHang"
            value={tenKhachHang} // State variable for customer name
            onChange={(e) => setTenKhachHang(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email} // State variable for email
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="sdt" style={{ display: 'block', marginBottom: '5px' }}>
            Số Điện Thoại (SĐT):
          </label>
          <input
            type="tel"
            id="sdt"
            value={sdt} // State variable for phone number
            onChange={(e) => setSdt(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="diaChi" style={{ display: 'block', marginBottom: '5px' }}>
            Địa Chỉ:
          </label>
          <textarea
            id="diaChi"
            value={diaChi} // State variable for address
            onChange={(e) => setDiaChi(e.target.value)}
            rows="3"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          style={{ padding: '10px 15px', cursor: 'pointer' }}
        >
          Thêm Khách Hàng
        </button>
      </form>
    </div>
  );
}

export default Customer; // Make the component available for import