// components/Register.jsx
import React, { useState } from 'react';
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
  const [examSchedule, setExamSchedule] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [registrationDetails, setRegistrationDetails] = useState(null);

  const handleIndividualChange = (e) => {
    const { name, value } = e.target;
    setIndividualInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleUnitChange = (e) => {
    const { name, value } = e.target;
    setUnitInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submittedData = registerType === 'individual' ? { ...individualInfo, selectedSchedule } : { ...unitInfo, selectedSchedule };
    setRegistrationDetails(submittedData);
    console.log("Registration Data:", submittedData);
  };

  return (
    <div className="register-container">
      <h1 className="register-title">Đăng Ký Kiểm Tra</h1>

      <div className="register-type-buttons">
        <button onClick={() => setRegisterType('individual')} className={registerType === 'individual' ? 'active' : ''}>Cá nhân</button>
        <button onClick={() => setRegisterType('unit')} className={registerType === 'unit' ? 'active' : ''}>Đơn vị</button>
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        {registerType === 'individual' ? (
          <div className="form-section">
            <h2 className="form-section-title">Thông tin cá nhân</h2>
            <input placeholder="Tên người đăng ký" name="registrantName" value={individualInfo.registrantName} onChange={handleIndividualChange} className="form-input" />
            <input placeholder="Tên người thi" name="examineeName" value={individualInfo.examineeName} onChange={handleIndividualChange} className="form-input" />
          </div>
        ) : (
          <div className="form-section">
            <h2 className="form-section-title">Thông tin đơn vị</h2>
            <input placeholder="Tên đơn vị" name="unitName" value={unitInfo.unitName} onChange={handleUnitChange} className="form-input" />
          </div>
        )}

        {/* Schedule selection would go here */}

        <button type="submit" className="form-submit-button">Đăng ký</button>
      </form>

      {registrationDetails && (
        <div className="registration-details">
          <h2 className="details-title">Thông tin đăng ký:</h2>
          <pre className="details-text">{JSON.stringify(registrationDetails, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Register;