
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
      { id: 1, name: 'Lịch 1 - Sáng thứ 7' },
      { id: 2, name: 'Lịch 2 - Chiều chủ nhật' },
      { id: 3, name: 'Lịch 3 - Tối thứ 3' },
    ];
    setAvailableSchedules(mockSchedules);
  };

  const hienThiLichThiDaChon = () => {
    return selectedSchedules.map(schedule => (
      <div key={schedule.id} className="schedule-item">
        <span>{schedule.name}</span>
        <button onClick={() => handleRemoveSelectedSchedule(schedule.id)}>Xóa</button>
      </div>
    ));
  };

  const btn_AddLichThi_Click = (schedule) => {
    if (!selectedSchedules.some(s => s.id === schedule.id)) {
      setSelectedSchedules([...selectedSchedules, schedule]);
    }
  };

  const handleRemoveSelectedSchedule = (scheduleId) => {
    setSelectedSchedules(selectedSchedules.filter(s => s.id !== scheduleId));
  };

  const btn_ThêmPhiếuĐăngKý_Click = async () => {
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

  const toggleRegisterType = () => {
    setRegisterType(prevType => (prevType === 'individual' ? 'unit' : 'individual'));
  };

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
            <div key={schedule.id} className="schedule-item">
              <span>{schedule.name}</span>
              <button onClick={() => btn_AddLichThi_Click(schedule)}>Thêm</button>
            </div>
          ))}
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
      <button onClick={btn_ThêmPhiếuĐăngKý_Click} className="form-submit-button">
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
