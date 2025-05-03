
import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import '../styles/Register.css';
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router-dom for navigation
import * as XLSX from 'xlsx';

function Register() {
  const apiUrl = import.meta.env.VITE_API_URL
  const navigate = useNavigate(); // Assuming you're using react-router-dom for navigation
  const [registerType, setRegisterType] = useState('individual');

  const [individualInfo, setIndividualInfo] = useState({
    registrantName: '',
    registrantContact: '',
    examineeName: '',
    examineeDob: '',
  });

  const [unitInfo, setUnitInfo] = useState({
    unitName: '',
    unitContact: '',
    examinees: [],
  });


  // Chứng chỉ
  const [certificates, setCertificates] = useState([]);
  const [certificateOption, setCertificateOption] = useState('');

  // Lịch thi
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState(null);
  const [allSchedules, setAllSchedules] = useState([]); 

  // Đăng ký
  const [registrationDetails, setRegistrationDetails] = useState(null);
  const [submissionStatus,  setSubmissionStatus] = useState(null);




  useEffect(() => {
    fetchCertificates();
    hienThiLichThiHienCo();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/register/get-certificates`);
      setCertificates(response.data);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    }
  };

  const handlePostSubmissionAction = () => {
    if (submissionStatus === 'success') {
      // Navigate to payment page or perform any other action
      navigate('/payment'); // Adjust the path as needed
    }
    else if (submissionStatus === 'error') {
      // Reset the form or perform any other action
      setIndividualInfo({
        registrantName: '',
        registrantContact: '',
        examineeName: '',
        examineeDob: '',
      });
      setUnitInfo({
        unitName: '',
        unitContact: '',
        examinees: [],
      });
      setCertificateOption('');
      setSelectedSchedules([]);
      setSubmissionStatus(null); // Reset submission status
    }
  };


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
  
      const fixedData = jsonData.map((row) => {
        const fixedRow = { ...row };
        for (const key in fixedRow) {
          if (
            key.toLowerCase().includes('dob') ||
            key.toLowerCase().includes('ngày') ||
            key.toLowerCase().includes('birth')
          ) {
            const value = fixedRow[key];
            if (!isNaN(value) && Number(value) > 30000) {
              const date = XLSX.SSF.parse_date_code(Number(value));
              fixedRow[key] = `${String(date.d).padStart(2, '0')}/${String(date.m).padStart(2, '0')}/${date.y}`;
            }
          }
        }
        return fixedRow;
      });
  
      setUnitInfo((prev) => ({ ...prev, examinees: fixedData }));
    };
  
    if (file) {
      reader.readAsArrayBuffer(file);
    }
  };
  
  const hienThiChungChi = () => {
    return (
      <>
        <option value="">-- Chọn chứng chỉ --</option>
        {Array.isArray(certificates) &&
          certificates.map((cert) => (
            <option key={cert.idchungchi} value={cert.idchungchi}>
              {cert.tenchungchi}
            </option>
          ))}
      </>
    );
  };
  
  const hienThiLichThiHienCo = async () => {    
    try {
      const response = await axios.get(`${apiUrl}/api/register/get-schedules`);
      const cleanedData = response.data.map(s => ({
        ...s,
       soluongthisinhhientai: s.soluongthisinhhientai ?? 0
      }));
      setAllSchedules(cleanedData); 
      setAvailableSchedules([]); 
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const hienThiLichThiDaChon = () => {
    if (selectedSchedules.length === 0) return null;
  
    const schedule = selectedSchedules[0]; // only one
    return (
      <div key={schedule.idlichthi} className="schedule-item-selection">
        <div><strong>Lịch thi {schedule.idlichthi}</strong></div>
        <div>Ngày thi: {schedule.ngaythi}</div>
        <div>Giờ thi: {schedule.giothi}</div>
        <div>Địa điểm: {schedule.diadiem}</div>
        <div>ID Phòng: {schedule.idphong}</div>
        <div>Nhân viên coi thi: {schedule.nhanviencoithi}</div>
        <div>Chứng chỉ thi: {schedule.tenchungchi}</div>
        <button onClick={() => handleRemoveSelectedSchedule(schedule.IDLichThi)}>Xóa</button>
      </div>
    );
  };
  
  

  const handleAddSelectedSchedule = (schedule) => {
    setSelectedSchedules([schedule]); // Only keep one selected schedule
  };
  
  const handleRemoveSelectedSchedule = (scheduleId) => {
    setSelectedSchedules(selectedSchedules.filter(s => s.IDLichThi !== scheduleId));
  };
  
  
  
  

  const btn_InsertNewRegistration_Click = async () => {
    // Check for empty fields
    if (registerType === 'individual') {
      if (
        !individualInfo.registrantName ||
        !individualInfo.registrantContact ||
        !individualInfo.examineeName ||
        !individualInfo.examineeDob
      ) {
        alert('Please fill in all required fields for individual registration.');
        return;
      }
    } else {
      if (
        !unitInfo.unitName ||
        !unitInfo.unitContact ||
        !unitInfo.examinees ||
        unitInfo.examinees.length === 0
      ) {
        alert('Please fill in all required fields for unit registration.');
        return;
      }
    }
  
    const registrationData = {
      registerType,
      registrantName: registerType === 'individual' ? individualInfo.registrantName : unitInfo.unitName,
      registrantContact: registerType === 'individual' ? individualInfo.registrantContact : unitInfo.unitContact,
      certificateOption,
      selectedSchedules,
      examinees:
        registerType === 'individual'
          ? [
              {
                examineeName: individualInfo.examineeName,
                examineeDob: individualInfo.examineeDob,
              },
            ]
          : unitInfo.examinees,
    };
  
    setRegistrationDetails(registrationData);
    console.log("Registration Data:", registrationData);
  
    try {
      const response = await axios.post(`${apiUrl}/api/register/add-register`, registrationData);
      console.log("Server Response:", response.data);
      setSubmissionStatus('success');
    } catch (error) {
      console.error("Error submitting registration:", error);
      setSubmissionStatus('error');
    }
  };
  

  const handleRegistrantNameChange = (e) => {
    const value = e.target.value;
    if (registerType === 'individual') {
      setIndividualInfo({ ...individualInfo, registrantName: value });
    } else {
      setUnitInfo({ ...unitInfo, unitName: value });
    }
  };

  const handleRegistrantContactChange = (e) => {
    const value = e.target.value;
    if (registerType === 'individual') {
      setIndividualInfo({ ...individualInfo, registrantContact: value });
    } else {
      setUnitInfo({ ...unitInfo, unitContact: value });
    }
  };

  const handleCertificateOptionChange = (e) => {
    const selectedId = e.target.value;
    setCertificateOption(selectedId);
  
    if (!selectedId) {
      setAvailableSchedules([]);
      return;
    }
  
    const selectedCert = certificates.find(cert => String(cert.idchungchi) === selectedId);
    if (!selectedCert) {
      setAvailableSchedules([]);
      return;
    }
  
    const filtered = allSchedules.filter(
      (s) => s.tenchungchi?.toLowerCase() === selectedCert.tenchungchi.toLowerCase()
    );
  
    setAvailableSchedules(filtered);
  };
  
    
  
  // const toggleRegisterType = () => {
  //   setRegisterType(prevType => (prevType === 'individual' ? 'unit' : 'individual'));
  // };

  return (
    <div className="register-container">
      <h1 className="register-title">Đăng Ký Kiểm Tra</h1>

     
      <div className="form-group">
        <div className="register-type-buttons">
          <button onClick={() => setRegisterType('individual')} className={registerType === 'individual' ? 'active' : ''}>Cá nhân</button>
          <button onClick={() => setRegisterType('unit')} className={registerType === 'unit' ? 'active' : ''}>Đơn vị</button>
        </div>
      </div>

      {/* TênKháchHàng: textbox */}
      <div className="form-group">
        <label htmlFor="registrantName">
          {registerType === 'individual' ? 'Tên người đăng ký:' : 'Tên đơn vị đăng ký:'}
        </label>
        <input
          type="text"
          id="registrantName"
          value={
            registerType === 'individual'
              ? individualInfo.registrantName
              : unitInfo.unitName
          }
          onChange={handleRegistrantNameChange}
          className="form-input w-full pr-20"
        />
      </div>

       {/* Contact */}
       <div className="form-group">
        <label htmlFor="registrantContact">
          {registerType === 'individual' ? 'Số điện thoại người đăng ký:' : 'Số điện thoại đơn vị:'}
        </label>
        <input
          type="text"
          id="registrantContact"
          value={registerType === 'individual' ? individualInfo.registrantContact : unitInfo.unitContact}
          onChange={handleRegistrantContactChange}
          className="form-input"
        />
      </div>

      {registerType === 'individual' ? (
      <>
        {/* Examinee Name */}
        <div className="form-group">
          <label htmlFor="examineeName">Tên thí sinh:</label>
          <input
            type="text"
            id="examineeName"
            value={individualInfo.examineeName}
            onChange={(e) =>
              setIndividualInfo({ ...individualInfo, examineeName: e.target.value })
            }
            className="form-input"
          />
        </div>

        {/* Examinee DOB */}
        <div className="form-group">
          <label htmlFor="examineeDob">Ngày sinh thí sinh:</label>
          <input
            type="date"
            id="examineeDob"
            value={individualInfo.examineeDob}
            onChange={(e) =>
              setIndividualInfo({ ...individualInfo, examineeDob: e.target.value })
            }
            className="form-input"
          />
        </div>
      </>
    ) : (
      <>
          {/* Unit Info Inputs */}
          <div className="form-group">
            <label htmlFor="unitName">Tên đơn vị:</label>
            <input
              type="text"
              id="unitName"
              value={unitInfo.unitName}
              onChange={(e) =>
                setUnitInfo({ ...unitInfo, unitName: e.target.value })
              }
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="unitContact">Thông tin liên hệ:</label>
            <input
              type="text"
              id="unitContact"
              value={unitInfo.unitContact}
              onChange={(e) =>
                setUnitInfo({ ...unitInfo, unitContact: e.target.value })
              }
              className="form-input"
            />
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label htmlFor="fileUpload">Tải lên danh sách thí sinh (Excel):</label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="form-input"
            />
          </div>

          {/* Preview Grid */}
          {unitInfo.examinees.length > 0 && (
            <div className="preview-table">
              <h4>Xác nhận danh sách thí sinh</h4>
              <table border="1" cellPadding="5">
                <thead>
                  <tr>
                    {Object.keys(unitInfo.examinees[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unitInfo.examinees.map((examinee, index) => (
                    <tr key={index}>
                      {Object.values(examinee).map((value, i) => (
                        <td key={i}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <div>
      {/* ChứngChiChon: combobox */}
      <div className="form-group">
        <label htmlFor="certificateOption">Chọn chứng chỉ:</label>
        <select
          id="certificateOption"
          value={certificateOption}
          onChange={handleCertificateOptionChange}
          className="form-select"
        >
          {hienThiChungChi()}
        </select>
      </div>

      {/* gridLichThiHienCo: gridview */}
      <div className="schedule-selection">
        <h2>Lịch thi hiện có</h2>
        <div className="grid-view" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {availableSchedules.length === 0 && (
            <div className="no-schedules">Không có lịch thi nào hiện có cho chứng chỉ này.</div>
          )}

          {availableSchedules.map(schedule => (
            <div
              key={schedule.idlichthi}
              className="schedule-item"
              onClick={() => setSelectedScheduleDetail(schedule)}
              style={{
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: '10px',
                backgroundColor: '#f9f9f9',
                cursor: 'pointer',
                position: 'relative',
                minHeight: '120px',
                minWidth: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                paddingBottom: '50px',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '8px', whiteSpace: 'normal', wordBreak: 'break-word'}}>
              <strong>Lịch thi {schedule.idlichthi}</strong><br />
              Ngày thi: {schedule.ngaythi}<br />
              Số lượng thí sinh: {schedule.soluongthisinhhientai ?? 0} / {schedule.sochotrong}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent triggering popup
                  handleAddSelectedSchedule(schedule);
                }}
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  padding: '6px 14px',
                  border: 'none',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                disabled={selectedSchedules.length > 0}
              >
                Thêm
              </button>
            </div>
          ))}

          {selectedScheduleDetail && (
            <div
              className="modal-overlay"
              onClick={() => setSelectedScheduleDetail(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '10px',
                  width: '300px',
                }}
              >
                <h2>Chi tiết lịch thi</h2>
                <p><strong>Ngày thi:</strong> {selectedScheduleDetail.ngaythi}</p>
                <p><strong>Giờ thi:</strong> {selectedScheduleDetail.giothi}</p>
                <p><strong>Địa điểm:</strong> {selectedScheduleDetail.diadiem}</p>
                <p><strong>Phòng:</strong> {selectedScheduleDetail.idphong}</p>
                <p><strong>Nhân viên coi thi:</strong> {selectedScheduleDetail.nhanviencoithi}</p>
                <p><strong>Chứng chỉ:</strong> {selectedScheduleDetail.tenchungchi}</p>
                <p><strong>Số lượng thí sinh:</strong> {selectedScheduleDetail.soluongthisinhhientai ?? 0} / {selectedScheduleDetail.sochotrong}</p>

                <button onClick={() => setSelectedScheduleDetail(null)}>Đóng</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* gridLichThiDaChon: gridview */}
      <div className="schedule-selection">
        <h2>Lịch thi đã chọn</h2>
        <div className="grid-view">
          {hienThiLichThiDaChon()}
        </div>
      </div>

      {/* btnThêmPhiếuĐăngKý: button */}
      <div className="form-actions form-group" style={{ marginTop: '20px' }}>

          {/* Show Submit/Retry button ONLY if submission hasn't been successful */}
          {submissionStatus !== 'success' && (
              <button
                onClick={btn_InsertNewRegistration_Click}
                className="form-submit-button"
              >
                Thêm Phiếu Đăng Ký
              </button>
          )}

          {/* Show the conditional GoToPayment/GoBack button AFTER an attempt (success or error) */}
          {submissionStatus !== null && ( // Only show after attempt and when not loading
              <button
                  type="button"
                  onClick={handlePostSubmissionAction}
                  // Use different classes for styling based on the outcome
                  className={submissionStatus === 'success' ? 'form-payment-button' : 'form-goback-button'}
                  style={{ marginLeft: submissionStatus !== 'success' ? '10px' : '0' }} // Add space only if retry button is also visible
              >
                  {submissionStatus === 'success' ? 'Đi đến Thanh toán' : 'Quay Lại'}
              </button>
          )}
      </div>
      {/* --- End Action Buttons Area --- */}


      {/* --- Submission Status Messages --- */}
      <div className="submission-status" style={{ marginTop: '15px' }}>
          {submissionStatus === 'success' && (
              <p className="success-message" style={{ color: 'green', fontWeight: 'bold' }}>
                  Đăng ký thành công! Nhấn nút "Đi đến Thanh toán" để tiếp tục.
              </p>
          )}
          {submissionStatus === 'error' && (
              <p className="error-message" style={{ color: 'red', fontWeight: 'bold' }}>
                  Đăng ký thất bại. Vui lòng kiểm tra lại thông tin. Bạn có thể "Thử lại Đăng ký" hoặc "Quay Lại".
              </p>
          )}
       </div>
    </div>
  );

  
}

export default Register;
