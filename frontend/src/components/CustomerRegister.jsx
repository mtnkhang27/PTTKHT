import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; // Importing useNavigate for navigation
import '../styles/CustomerRegister.css'; // Import the CSS file for styling

const CustomerRegister = () => {

    const navigate = useNavigate(); 
    const apiUrl = import.meta.env.VITE_API_URL
    const [formData, setFormData] = useState({
        khachHangName: '', // Customer Name
        sdt: '',          // Phone Number
    });

    // State to store the list of registered forms (phieu dang ky)
    const [registrations, setRegistrations] = useState([]);

    // Handles changes in the input fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    // Handles the payment button click
    const handleThanhToanClick = (registration) => {
        navigate('/payment'); 
    }

    // Handles the form submission
        const handleSubmit = async(e) => {
            e.preventDefault(); // Prevent default page reload

        try {
            const response = await axios.get(`${apiUrl}/api/search/get-registers-customer-filtered`, {
                params: {
                    name: formData.khachHangName,
                    sdt: formData.sdt
                }
            });

            const fetchedData = response.data;

            setRegistrations(fetchedData); // Set data from backend
            console.log('Fetched registrations:', fetchedData);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        }
    };

    return (
        // 2. Add the className to the main wrapping div
        <div className="customer-register-container">
            {/* Section for adding a new registration */}
            <h2>Thêm Phiếu Đăng Ký Mới</h2> {/* New Registration Form */}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="khachHangName">Tên khách hàng:</label> {/* Customer Name */}
                    <input
                        type="text"
                        id="khachHangName"
                        name="khachHangName" // Make sure name matches state key
                        value={formData.khachHangName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="sdt">SĐT:</label> {/* Phone Number */}
                    <input
                        type="tel" // Use type="tel" for phone numbers
                        id="sdt"
                        name="sdt"         // Make sure name matches state key
                        value={formData.sdt}
                        onChange={handleChange}
                        required
                        pattern="[0-9\s+-]*" // Basic pattern, adjust if needed
                    />
                </div>
                <button type="submit">Tra cứu</button> {/* Register */}
            </form>

            <hr /> {/* Separator */}

            {/* Section for displaying registered forms */}
            <h2>Danh sách Phiếu Đăng Ký</h2> {/* List of Registration Forms */}
            {registrations.length === 0 ? (
                // Message shown when there are no registrations
                <p>Không có phiếu đăng ký nào.</p> // No registration forms.
            ) : (
                // Grid view (using a simple table here)
                // Removed inline styles, rely on CSS file now
                <table>
                    <thead>
                        <tr>
                            <th>Mã phiếu</th>
                            <th>Tên khách hàng</th>
                            <th>Ngày đăng ký</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.map((reg, index) => (
                            <tr key={index}>
                                <td>{reg.idphieudangky}</td>
                                <td>{reg.tenkhachhang}</td>
                                <td>{reg.ngaydangky}</td>
                                <td>{reg.trangthai}</td>
                                <td>
                                {reg.trangthai === 'Chờ thanh toán' && (
                                    <button onClick={() => handleThanhToanClick(reg)} className="pay-btn">
                                        Thanh Toán
                                    </button>
                                )}
                            </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            )}
        </div>
    );
};

export default CustomerRegister;
