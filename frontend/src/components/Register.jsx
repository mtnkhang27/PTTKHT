
import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import '../styles/Register.css';

function Register() {
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

  const [certificateOption, setCertificateOption] = useState('');
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [registrationDetails, setRegistrationDetails] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState(null);



  useEffect(() => {
    hienThiLichThiHienCo();
  }, []);

  const hienThiChungChi = () => {
    return (
      <>
        <option value="">-- Chọn chứng chỉ --</option>
        <option value="toeic">TOEIC</option>
        <option value="ielts">IELTS</option>
        <option value="vstep">VSTEP</option>
      </>
    );
  };

  const hienThiLichThiHienCo = () => {
    const mockSchedules = [
      {
        IDLichThi: 1,
        NgayThi: '2025-05-15',
        GioThi: '08:00',
        DiaDiem: 'Hội trường A',
        IDPhong: 101,
        NhanVienCoiThi: 1001,
        ChungChiThi: 'TOEIC'
      },
      {
        IDLichThi: 2,
        NgayThi: '2025-05-16',
        GioThi: '13:00',
        DiaDiem: 'Hội trường B',
        IDPhong: 102,
        NhanVienCoiThi: 1002,
        ChungChiThi: 'IELTS'
      },
      {
        IDLichThi: 3,
        NgayThi: '2025-05-17',
        GioThi: '19:00',
        DiaDiem: 'Hội trường C',
        IDPhong: 103,
        NhanVienCoiThi: 1003,
        ChungChiThi: 'VSTEP'
      }
    ];
    
    setAvailableSchedules(mockSchedules);
  };

  const hienThiLichThiDaChon = () => {
    if (selectedSchedules.length === 0) return null;
  

    return (
      selectedSchedules.map(schedule =>
        <div key={schedule.IDLichThi} className="schedule-item-selection">
          <div><strong>Lịch thi {schedule.IDLichThi}</strong></div>
          <div>Ngày thi: {schedule.NgayThi}</div>
          <div>Giờ thi: {schedule.GioThi}</div>
          <div>Địa điểm: {schedule.DiaDiem}</div>
          <div>ID Phòng: {schedule.IDPhong}</div>
          <div>Nhân viên coi thi: {schedule.NhanVienCoiThi}</div>
          <div>Chứng chỉ thi: {schedule.ChungChiThi}</div>
          <button onClick={() => handleRemoveSelectedSchedule(schedule.IDLichThi)}>Xóa</button>
        </div>
      )
    );
  };
  

  const handleAddSelectedSchedule = (schedule) => {
    if (!selectedSchedules.some(s => s.IDLichThi === schedule.IDLichThi)) {
      setSelectedSchedules([...selectedSchedules, schedule]);
    }
  };
  
  const handleRemoveSelectedSchedule = (scheduleId) => {
    setSelectedSchedules(selectedSchedules.filter(s => s.IDLichThi !== scheduleId));
  };
  
  
  

  const btn_InsertNewRegistration_Click = async () => {
    const registrationData = {
      registerType,
      registrantName: registerType === 'individual' ? individualInfo.registrantName : unitInfo.unitName,
      registrantContact: registerType === 'individual' ? individualInfo.registrantContact : unitInfo.unitContact,
      examineeName: individualInfo.examineeName,
      examineeDob: individualInfo.examineeDob,
      certificateOption,
      selectedSchedules,
    };

    setRegistrationDetails(registrationData);

    console.log("Registration Data:", registrationData);


    // try {
    //   // 👇 Replace URL with your backend API endpoint
    //   const response = await axios.post('http://localhost:5000/api/register', registrationData);
    //   console.log("Server Response:", response.data);
    //   setSubmissionStatus('success');
    // } catch (error) {
    //   console.error("Error submitting registration:", error);
    //   setSubmissionStatus('error');
    // }
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
    setCertificateOption(e.target.value);
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
          value={registerType === 'individual' ? individualInfo.registrantName : unitInfo.unitName}
          onChange={handleRegistrantNameChange}
          className="form-input"
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

      {/* Examinee Name */}
      <div className="form-group">
        <label htmlFor="examineeName">Tên thí sinh:</label>
        <input
          type="text"
          id="examineeName"
          value={individualInfo.examineeName}
          onChange={(e) => setIndividualInfo({ ...individualInfo, examineeName: e.target.value })}
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
          onChange={(e) => setIndividualInfo({ ...individualInfo, examineeDob: e.target.value })}
          className="form-input"
        />
      </div>


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
        <div className="grid-view">
          {availableSchedules.map(schedule => (
            <div
              key={schedule.IDLichThi}
              className="schedule-item"
              onClick={() => setSelectedScheduleDetail(schedule)}
              style={{
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: '10px',
                marginBottom: '16px',
                backgroundColor: '#f9f9f9',
                cursor: 'pointer',
                position: 'relative',
                minHeight: '120px',
                minWidth: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                paddingBottom: '50px', // extra space for button
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '8px', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center' }}>
                <strong>Lịch thi {schedule.IDLichThi}</strong><br />
                Ngày thi: {schedule.NgayThi}
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
              >
                Thêm
              </button>
            </div>
          ))}


        {selectedScheduleDetail && (
          <div className="modal-overlay" onClick={() => setSelectedScheduleDetail(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Chi tiết lịch thi</h2>
              <p><strong>Ngày thi:</strong> {selectedScheduleDetail.NgayThi}</p>
              <p><strong>Giờ thi:</strong> {selectedScheduleDetail.GioThi}</p>
              <p><strong>Địa điểm:</strong> {selectedScheduleDetail.DiaDiem}</p>
              <p><strong>Phòng:</strong> {selectedScheduleDetail.IDPhong}</p>
              <p><strong>Nhân viên coi thi:</strong> {selectedScheduleDetail.NhanVienCoiThi}</p>
              <p><strong>Chứng chỉ:</strong> {selectedScheduleDetail.ChungChiThi}</p>

              <button onClick={() => setSelectedScheduleDetail(null)}>Đóng</button>
            </div>
          </div>
        )}
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
      <button onClick={btn_InsertNewRegistration_Click} className="form-submit-button">
        Thêm phiếu đăng ký
      </button>

      {/* Display registration details */}
      {registrationDetails && (
        <div className="registration-details">
          <h2 className="details-title">Thông tin đăng ký:</h2>
          <pre className="details-text">{JSON.stringify(registrationDetails, null, 2)}</pre>
        </div>
      )}

      {/* Show status */}
      {submissionStatus === 'success' && <p className="success-message">Đăng ký thành công!</p>}
      {submissionStatus === 'error' && <p className="error-message">Đăng ký thất bại. Vui lòng thử lại.</p>}
    </div>
  );

  
}

export default Register;
