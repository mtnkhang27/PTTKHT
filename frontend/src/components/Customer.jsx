import React, { useState } from 'react';


function Customer() {
  
  const [tenKhachHang, setTenKhachHang] = useState(''); // TênKháchHàng
  const [email, setEmail] = useState('');             // Email
  const [sdt, setSdt] = useState('');                 // SĐT (Số Điện Thoại)
  const [diaChi, setDiaChi] = useState('');           // ĐịaChỉ

  // --- Event Handlers ---


  const handleAddCustomerClick = (event) => {
    // Prevent default form submission behavior (page reload)
    event.preventDefault();

    // Gather the data from the state
    const customerData = {
      name: tenKhachHang,
      email: email,
      phone: sdt,
      address: diaChi,
    };

    console.log('Submitting Customer Data:', customerData);

    alert('Khách hàng đã được thêm (Check console for data)!'); // Simple feedback
  };

  // --- JSX Rendering ---
  // Renders the form with input fields and the button

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px', maxWidth: '400px' }}>
      <h2>Thêm Khách Hàng Mới</h2>
      {/* Use a form element for semantic structure and accessibility */}
      <form onSubmit={handleAddCustomerClick}>
        {/* Tên Khách Hàng Input */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="tenKhachHang" style={{ display: 'block', marginBottom: '5px' }}>
            Tên Khách Hàng:
          </label>
          <input
            type="text"
            id="tenKhachHang"
            value={tenKhachHang}
            onChange={(e) => setTenKhachHang(e.target.value)} // Update state on change
            required // Example: Make field required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Email Input */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email:
          </label>
          <input
            type="email" // Use type="email" for basic email validation
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {/* SĐT (Phone Number) Input */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="sdt" style={{ display: 'block', marginBottom: '5px' }}>
            Số Điện Thoại (SĐT):
          </label>
          <input
            type="tel" // Use type="tel" for phone numbers
            id="sdt"
            value={sdt}
            onChange={(e) => setSdt(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Địa Chỉ Input */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="diaChi" style={{ display: 'block', marginBottom: '5px' }}>
            Địa Chỉ:
          </label>
          <textarea // Use a textarea for potentially longer address input
            id="diaChi"
            value={diaChi}
            onChange={(e) => setDiaChi(e.target.value)}
            rows="3"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        {/* Submit Button (btnThêmKháchHàng) */}
        <button
          type="submit" // Use type="submit" when inside a <form>
          style={{ padding: '10px 15px', cursor: 'pointer' }}
        >
          Thêm Khách Hàng
        </button>
      </form>
    </div>
  );
}

export default Customer; // Make the component available for import