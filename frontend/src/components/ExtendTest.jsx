// components/ExtendTest.jsx
import React, { useState } from 'react';
import '../styles/ExtendTest.css';

function ExtendTest() {
  const [registrationId, setRegistrationId] = useState('');
  const [extensionInfo, setExtensionInfo] = useState(null);
  const [newScheduleOptions, setNewScheduleOptions] = useState([]);
  const [selectedNewSchedule, setSelectedNewSchedule] = useState(null);
  const [extensionFee, setExtensionFee] = useState(0);

  const handleCheckExtension = () => {
    // Mock data - replace with API call
    const extensionData = {
      id: registrationId,
      isEligible: true,
      reason: "Bệnh tật",
      originalSchedule: "10:00 2024-12-25",
      isSpecialCase: true
    };
    setExtensionInfo(extensionData);

    if (!extensionData.isSpecialCase) {
      setExtensionFee(50000);
    }

    const scheduleOptions = [
      { id: 1, time: "14:00 2024-12-28" },
      { id: 2, time: "10:00 2025-01-05" }
    ];
    setNewScheduleOptions(scheduleOptions);
  };

  const handleSelectNewSchedule = (schedule) => {
    setSelectedNewSchedule(schedule);
  };

  const handleExtend = () => {
    console.log("Extension requested:", { registrationId, selectedNewSchedule });
  };

  return (
    <div className="extend-container">
      <h1 className="extend-title">Gia Hạn Thời Gian Thi</h1>
      <div className="extend-input-area">
        <input
          placeholder="Nhập mã phiếu dự thi"
          value={registrationId}
          onChange={(e) => setRegistrationId(e.target.value)}
          className="extend-input"
        />
        <button onClick={handleCheckExtension} className="extend-button">Kiểm tra gia hạn</button>
      </div>

      {extensionInfo && (
        <div className="extension-info">
          <h2 className="extension-info-title">Thông tin gia hạn</h2>
          <p>Mã phiếu dự thi: {extensionInfo.id}</p>
          <p>Lý do: {extensionInfo.reason}</p>
          <p>Lịch thi ban đầu: {extensionInfo.originalSchedule}</p>

          {newScheduleOptions.length > 0 && (
            <div className="new-schedule-options">
              <h3>Chọn lịch thi mới:</h3>
              {newScheduleOptions.map(schedule => (
                <button key={schedule.id} onClick={() => handleSelectNewSchedule(schedule)} className="schedule-button">
                  {schedule.time}
                </button>
              ))}
            </div>
          )}

          {extensionFee > 0 && <p className="extension-fee">Phí gia hạn: {extensionFee}</p>}

          <button onClick={handleExtend} className="extend-submit-button">Gia hạn</button>
        </div>
      )}
    </div>
  );
}

export default ExtendTest;