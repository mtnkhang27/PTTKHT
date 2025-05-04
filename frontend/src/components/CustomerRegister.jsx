import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation
import '../styles/CustomerRegister.css'; // Import the CSS file for styling

// Component definition
const CustomerRegister = () => {

    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL 

    // State for general form input data (used for 'phieuDuThi')
    const [formData, setFormData] = useState({
        khachHangName: '', // Customer Name
        sdt: '',           // Phone Number
    });
    // State specifically for the registration ID input (used for 'phieuDangKy')
    const [phieuDangKyId, setPhieuDangKyId] = useState('');

    // State to store the search results
    const [registrations, setRegistrations] = useState([]);
    // State to store the selected search type ('phieuDangKy' or 'phieuDuThi')
    const [searchType, setSearchType] = useState('phieuDangKy'); // Default to 'phieuDangKy'

    // Handles changes in the text input fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Update the correct state based on the input field's name
        if (name === 'phieuDangKyIdInput') {
            setPhieuDangKyId(value);
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                [name]: value // Handles khachHangName and sdt
            }));
        }
    };

    const handlePrintClick = async(registration) => {
        try {
            const response = await axios.post(
              `${apiUrl}/api/search/download-exam-form`, // Endpoint for generating PDF
              registration,
              { responseType: 'blob' } // important for binary data
            );
        
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `phieu_duthi_${registration.sobaodanh || 'unknown'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
          } catch (err) {
            console.error('PDF generation error:', err);
            alert('Không thể tạo PDF.');
          }
    };

    // Handles changes in the search type radio buttons
    const handleSearchTypeChange = (e) => {
        const newSearchType = e.target.value;
        setSearchType(newSearchType);
        // Clear previous results and input fields when changing search type
        setRegistrations([]);
        setFormData({ khachHangName: '', sdt: '' }); // Clear name/phone inputs
        setPhieuDangKyId(''); // Clear ID input
    };

    // Handles the click event for the 'Thanh Toán' (Payment) button
    const handleThanhToanClick = (registration) => {
        console.log("Navigating to payment for:", registration);
        navigate('/payment', { state: { registrationId: registration.idphieudangky } });
    }

    // Handles the form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Searching for:', searchType);

        let endpoint = '';
        let params = {};

        // Configure endpoint and parameters based on the search type
        if (searchType === 'phieuDangKy') {
            endpoint = `${apiUrl}/api/search/get-registers-customer-filtered`; // Example if ID is a query parameter
            params = {
                name: formData.khachHangName,
                sdt: formData.sdt
            };
            console.log('Search params (ID):', params);
        } else if (searchType === 'phieuDuThi') {
            // Endpoint and params for searching examination forms by name and phone
            endpoint = `${apiUrl}/api/search/get-exam-forms-customer-filtered`; // **REPLACE with your actual endpoint**
            params = { id: phieuDangKyId }; // Example query parameter { id: '...' }
            console.log('Search params (Name/SĐT):', params);
        } else {
            console.error('Invalid search type selected');
            return;
        }

        // Make the API request
        try {
           
            const response = await axios.get(endpoint, { params }); 

            const fetchedData = response.data;

            // Handle potential single object response when searching by ID
            if (searchType === 'phieuDangKy' && fetchedData && typeof fetchedData === 'object' && !Array.isArray(fetchedData)) {
                setRegistrations([fetchedData]);
            } else {
                // Otherwise, expect an array (or handle non-array as empty)
                setRegistrations(Array.isArray(fetchedData) ? fetchedData : []);
            }

            console.log('Fetched results:', fetchedData);

            if ((!Array.isArray(fetchedData) || fetchedData.length === 0) && !(searchType === 'phieuDangKy' && fetchedData && typeof fetchedData === 'object')) {
                console.log('No results found.');
                 setRegistrations([]); // Ensure empty array if no results
            }

        } catch (error) {
            console.error('Error fetching results:', error);
            setRegistrations([]); // Clear results on error
        }
    };

    // Helper function to format date strings
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString;
        }
    };

    // Render the component UI
    return (
        <div className="customer-register-container">
            <h2>Tra cứu thông tin</h2>

            {/* Radio button group for selecting search type */}
            <div className="search-type-selection">
                <label>
                    <input
                        type="radio"
                        value="phieuDangKy"
                        checked={searchType === 'phieuDangKy'}
                        onChange={handleSearchTypeChange}
                    />
                    Phiếu Đăng Ký
                </label>
                <label>
                    <input
                        type="radio"
                        value="phieuDuThi"
                        checked={searchType === 'phieuDuThi'}
                        onChange={handleSearchTypeChange}
                    />
                    Phiếu Dự Thi
                </label>
            </div>

            {/* Form submission handled by handleSubmit */}
            <form onSubmit={handleSubmit}>
                {/* Conditional rendering of input fields based on searchType */}
                {searchType === 'phieuDuThi' ? (
                    // Input field for Registration ID
                    <div>
                        <label htmlFor="phieuDangKyIdInput">Mã phiếu đăng ký:</label>
                        <input
                            type="text"
                            id="phieuDangKyIdInput"
                            name="phieuDangKyIdInput" // Use specific name for ID input
                            value={phieuDangKyId}
                            onChange={handleChange}
                            required
                            placeholder="Nhập mã phiếu đăng ký" // Add placeholder
                        />
                    </div>
                ) : (
                    // Input fields for Customer Name and Phone Number
                    <>
                        <div>
                            <label htmlFor="khachHangName">Tên khách hàng:</label>
                            <input
                                type="text"
                                id="khachHangName"
                                name="khachHangName"
                                value={formData.khachHangName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="sdt">SĐT:</label>
                            <input
                                type="tel"
                                id="sdt"
                                name="sdt"
                                value={formData.sdt}
                                onChange={handleChange}
                                required
                                pattern="[0-9\s+-]*"
                            />
                        </div>
                    </>
                )}
                {/* Submit button */}
                <button type="submit">Tra cứu</button>
            </form>

            <hr />

            {/* Results section */}
            <h2>
                {searchType === 'phieuDangKy'
                    ? 'Danh sách Phiếu Đăng Ký' // Changed title for single result possibility
                    : 'Danh sách Phiếu Dự Thi'}
            </h2>

            {/* Results Table/Message */}
            {registrations.length === 0 ? (
                <p>Không có {searchType === 'phieuDangKy' ? 'phiếu đăng ký' : 'phiếu dự thi'} nào được tìm thấy.</p>
            ) : (
                <div className='table-container'>
                    
                    <table>
                        <thead>
                            <tr>
                                {/* Conditionally render table headers based on searchType */}
                                {searchType === 'phieuDangKy' ? (
                                    <>
                                        <th>Mã phiếu ĐK</th>
                                        <th>Tên khách hàng</th>
                                        <th>Ngày đăng ký</th>
                                        <th>Trạng thái ĐK</th>
                                        <th>Hành động</th>
                                    </>
                                ) : ( // Headers for 'phieuDuThi'
                                    <>
                                        <th>Số báo danh</th>
                                        <th>Tên thí sinh</th>
                                        <th>Tên khách hàng</th>
                                        <th>Ngày sinh</th>
                                        <th>Chứng chỉ</th>
                                        <th>Ngày thi</th>
                                        <th>Địa điểm thi</th>
                                        <th>Giờ thi</th>
                                        <th>Phòng thi</th>
                                        <th>In phiếu thi</th>
                                        {/* Add other relevant headers for exam forms if needed */}
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Map over the results array to create table rows */}
                            {registrations.map((reg, index) => (
                                // Use a unique key for each row
                                <tr key={reg.idphieudangky || reg.idphieuduthi || index}>
                                    {/* Conditionally render table data cells based on searchType */}
                                    {searchType === 'phieuDangKy' ? (
                                        <>
                                            <td>{reg.idphieudangky || 'N/A'}</td>
                                            <td>{reg.tenkhachhang || 'N/A'}</td>
                                            <td>{formatDate(reg.ngaydangky)}</td>
                                            <td>{reg.trangthai || 'N/A'}</td>
                                            <td>
                                                {/* Show payment button only if status allows */}
                                                {reg.trangthai === 'Chờ thanh toán' && (
                                                    <button onClick={() => handleThanhToanClick(reg)} className="pay-btn">
                                                        Thanh Toán
                                                    </button>
                                                )}
                                            </td>
                                        </>
                                    ) : ( // Data cells for 'phieuDuThi'
                                        <>
                                            <td>{reg.sobaodanh || 'N/A'}</td>
                                            <td>{reg.tenthisinh || 'N/A'}</td>
                                            <td>{reg.tenkhachhang || 'N/A'}</td>
                                            <td>{formatDate(reg.ngaysinhts)}</td>
                                            <td>{reg.tenchungchi || 'N/A'}</td>
                                            <td>{formatDate(reg.ngaythi)}</td>
                                            <td>{reg.diadiem || 'N/A'}</td>
                                            <td>{reg.giothi || 'N/A'}</td>
                                            <td>{reg.idphong || 'N/A'}</td>
                                            <td>                   
                                                <button onClick={() => handlePrintClick(reg)} className="pay-btn">
                                                    In phiếu thi
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}      
        </div>
    );
};

export default CustomerRegister;
