// components/ExtendTest.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/ExtendTest.css'; // Ensure this CSS file exists for styling

// Assume a constant for your API base URL
// The code uses import.meta.env.VITE_API_URL, which is common in Vite projects.
// Make sure you have a .env file in your project root with a line like:
// VITE_API_URL=http://localhost:3000
// Replace http://localhost:3000 with the actual URL of your backend server.

function ExtendTest() {
  // Get API URL from environment variables (Vite)
  const apiUrl = import.meta.env.VITE_API_URL;

  const navigate = useNavigate(); // Get the navigate function

  // --- State Variables ---
  // State for form inputs
  const [sobaodanh, setSobaodanh] = useState('');
  // IMPORTANT: Replace with actual staff ID handling (e.g., from authentication context or login state)
  // This is a placeholder and insecure for production.
  const [staffId, setStaffId] = useState(1); // Placeholder staff ID
  const [reason, setReason] = useState(''); // Input for reason (text)
  const [isSpecialCase, setIsSpecialCase] = useState(false); // Input for special case checkbox (boolean)

  // State variables for storing results from the /check API call
  const [checkResult, setCheckResult] = useState(null); // Stores the full response body from /reschedule/check
  const [availableSchedules, setAvailableSchedules] = useState([]); // Stores the availableDates array from checkResult

  // State variable for the selected new schedule ID (used in /confirm call)
  const [selectedNewScheduleId, setSelectedNewScheduleId] = useState(null);

  // State for managing UI feedback: loading, errors, and success messages
  const [loadingCheck, setLoadingCheck] = useState(false); // Loading state specifically for the check button
  const [loadingConfirm, setLoadingConfirm] = useState(false); // Loading state specifically for the confirm button
  const [error, setError] = useState(null); // Error message state
  const [successMessage, setSuccessMessage] = useState(null); // Success message state

  // --- Event Handlers ---

  // Handler for the "Kiểm tra gia hạn" button click
  const handleCheckExtension = async () => {
    // Reset previous states before a new check
    setLoadingCheck(true); // Start loading indicator for check
    setLoadingConfirm(false); // Ensure confirm loading is false
    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages
    setCheckResult(null); // Clear previous check results
    setAvailableSchedules([]); // Clear previous schedule options
    setSelectedNewScheduleId(null); // Clear previous schedule selection

    // Basic client-side validation for required inputs
    if (!sobaodanh || !staffId) {
      setError('Vui lòng nhập Mã phiếu dự thi và Mã nhân viên.');
      setLoadingCheck(false); // Stop loading
      return; // Stop execution if validation fails
    }

    // Construct the request body
    const requestBody = {
      sobaodanh: parseInt(sobaodanh, 10), // Ensure SBD is sent as a number
      reason: reason, // Send reason input
      isSpecialCase: isSpecialCase, // Send special case status
      idnhanvienTiepNhan: staffId, // Send staff ID handling the check
    };

    try {
      // Perform the API call to the backend check endpoint
      const response = await fetch(`${apiUrl}/api/reschedule/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify content type
        },
        body: JSON.stringify(requestBody), // Send the JSON request body
      });

      const data = await response.json(); // Parse the JSON response body

      // Handle API errors (status codes outside 200-299 range)
      if (!response.ok) {
        // Display backend error message if available, otherwise a generic one
        setError(data.error || 'Đã xảy ra lỗi khi kiểm tra gia hạn.');
        setCheckResult(null); // Ensure check result is cleared on error
        setLoadingCheck(false); // Stop loading
        return; // Stop further processing
      }

      // If response is OK, update state with successful check results
      setCheckResult(data); // Store the full response data
      // Store available dates array (will be empty if backend didn't return any)
      setAvailableSchedules(data.availableDates || []);
      setLoadingCheck(false); // Stop loading

    } catch (err) {
      // Handle network errors or unexpected JavaScript errors
      console.error('Error during check:', err); // Log the error
      setError('Không thể kết nối đến máy chủ hoặc lỗi mạng.'); // Display a user-friendly error message
      setCheckResult(null); // Ensure check result is cleared on error
      setLoadingCheck(false); // Stop loading
    }
  };

  // Handler for selecting a new schedule from the available options list
  const handleSelectNewSchedule = (scheduleId) => {
    setSelectedNewScheduleId(scheduleId); // Set the ID of the chosen schedule
  };

  // Handler for the "Xác nhận gia hạn" button click
  const handleExtend = async () => {
    setLoadingConfirm(true); // Start loading indicator for confirm
    setLoadingCheck(false); // Ensure check loading is false
    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages

    // Client-side validation: if schedules were displayed, a selection is required
    if (availableSchedules.length > 0 && !selectedNewScheduleId) {
        setError('Vui lòng chọn lịch thi mới từ danh sách.');
        setLoadingConfirm(false); // Stop loading
        return; // Stop execution
    }
    // Note: If availableSchedules is empty, we proceed assuming the backend
    // can handle the confirm without a new schedule ID, possibly by applying
    // a default or just extending the deadline on the existing test date.
    // This aligns with the previous backend code review where idlichthimoi was needed.
    // If empty availableSchedules mean NO reschedule is possible, the backend check
    // should ideally have returned success: false or an empty array.
    // Assuming success:true AND empty availableSchedules means confirm uses original/default date.


    // Construct the request body for confirmation
    const requestBody = {
      sobaodanh: parseInt(sobaodanh, 10), // Original SBD
      // Send the ID of the selected new schedule. This will be null if no schedule
      // was available or selected.
      idlichthimoi: selectedNewScheduleId,
      idnhanvienLapDon: staffId, // Staff ID performing the confirmation
      // Pass isSpecialCase again, as backend confirm logic might depend on it (e.g., fee calculation)
      isSpecialCase: checkResult ? checkResult.isSpecialCase : false // Use the value from the check result
    };


    try {
      // Perform the API call to the backend confirm endpoint
      const response = await fetch(`${apiUrl}/api/reschedule/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify content type
        },
        body: JSON.stringify(requestBody), // Send the JSON request body
      });

      const data = await response.json(); // Parse the JSON response body
      console.log(data);

      // Handle API errors
      if (!response.ok) {
        // Display backend error message
        setError(data.error || 'Đã xảy ra lỗi khi xác nhận gia hạn.');
        setLoadingConfirm(false); // Stop loading
        return; // Stop further processing
      }

      // If response is OK, update state with success message
      //setSuccessMessage(data.message || 'Gia hạn thành công!'); // No longer set success message here
      // Redirect to payment page and pass the sobaodanh
      navigate('/payment', { state: { registrationId: data.phieuGiaHan.idphieudangky } });


      // Reset form and state variables are not needed here as we navigate away

      setLoadingConfirm(false); // Stop loading (though navigation happens)

    } catch (err) {
      // Handle network errors or unexpected JavaScript errors
      console.error('Error during confirm:', err); // Log the error
      setError('Không thể kết nối đến máy chủ hoặc lỗi mạng.'); // Display user-friendly error
      setLoadingConfirm(false); // Stop loading
    }
  };

  // Determine if either check or confirm is currently loading
  const isLoading = loadingCheck || loadingConfirm;

  // --- Render Method ---
  return (
    <div className="extend-container">
      <h1 className="extend-title">Gia Hạn Thời Gian Thi</h1>

      {/* Input Area: Section for user inputs */}
      <div className="extend-section input-area">
        <h2 className="section-title">Thông tin gia hạn</h2>
        <div className="input-group">
            <label htmlFor="sobaodanh">Mã phiếu dự thi:</label>
            <input
              id="sobaodanh"
              type="text"
              placeholder="Nhập mã phiếu dự thi"
              value={sobaodanh} // Bind input value to state
              onChange={(e) => setSobaodanh(e.target.value)} // Update state on input change
              className="extend-input" // Apply CSS class
              disabled={isLoading} // Disable inputs while loading
            />
        </div>
        <div className="input-group">
             {/* Staff ID Input (Replace with proper authentication handling in production) */}
             {/* Ensure the staffId state is populated correctly upon user login */}
            <label htmlFor="staffId">Mã nhân viên:</label>
            <input
              id="staffId"
              type="number" // Use number type for numeric input
              placeholder="Mã nhân viên"
              value={staffId}
              onChange={(e) => setStaffId(parseInt(e.target.value, 10) || '')} // Update state, parse to integer, handle empty input
              className="extend-input"
              disabled={isLoading} // Disable inputs while loading
            />
        </div>
        <div className="input-group">
            <label htmlFor="reason">Lý do gia hạn:</label>
             <textarea
              id="reason"
              placeholder="Lý do gia hạn (nếu có)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="extend-textarea" // Use textarea for multi-line reason
              disabled={isLoading} // Disable inputs while loading
              rows="3" // Suggest initial number of rows
            />
        </div>
         <div className="input-group checkbox-group">
            {/* Checkbox for Special Case */}
            <input
                id="isSpecialCase"
                type="checkbox"
                checked={isSpecialCase} // Bind checkbox checked state to state
                onChange={(e) => setIsSpecialCase(e.target.checked)} // Update state on change
                disabled={isLoading} // Disable checkbox while loading
            />
            <label htmlFor="isSpecialCase">Trường hợp đặc biệt (Cần minh chứng giấy tờ)</label>
        </div>


        {/* Button to trigger the eligibility check */}
        <button
          onClick={handleCheckExtension} // Attach handler
          className="extend-button check-button" // Apply CSS class
          // Disable button if loading check, loading confirm, or if required fields are empty
          disabled={loadingCheck || loadingConfirm || !sobaodanh || !staffId}
        >
          {/* Button text changes based on loading state */}
          {loadingCheck ? 'Đang kiểm tra...' : 'Kiểm tra gia hạn'}
        </button>
      </div>

      {/* Messages Area: Loading, Error, Success */}
       {(isLoading || error || successMessage) && (
           <div className="extend-section message-area">
               {/* Loading Indicator Display */}
               {loadingCheck && <p className="loading-message">Đang kiểm tra thông tin...</p>}
               {loadingConfirm && <p className="loading-message">Đang xác nhận gia hạn...</p>}

               {/* Error Message Display */}
               {error && <p className="error-message">{error}</p>}

               {/* Success Message Display */}
               {successMessage && <p className="success-message">{successMessage}</p>}
           </div>
       )}


      {/* Section to display check results and options */}
      {/* Only render if checkResult is available, not loading, and no error */}
      {checkResult && !isLoading && !error && (
        <div className="extend-section results-area">
          <h2 className="section-title">Kết quả kiểm tra</h2>
          {/* Display overall success status from backend check */}
          {checkResult.success ? (
            <div className="check-success-details">
              <p><strong>Trạng thái:</strong> Hợp lệ để gia hạn.</p>
              <p><strong>Số lần gia hạn đã thực hiện:</strong> {checkResult.currentRescheduleCount}</p>
              <p><strong>Trường hợp:</strong> {checkResult.isSpecialCase ? 'Đặc biệt' : 'Thông thường'}</p>

              {/* Display fee information if required (backend indicates this) */}
              {checkResult.feeRequired && (
                // Note: The backend /check endpoint currently only indicates IF a fee is required.
                // Displaying the specific amount would require the backend to send the amount
                // in the check response, or the frontend to have logic to determine it.
                <p className="extension-fee"><strong>Lưu ý:</strong> Gia hạn này sẽ phát sinh phí theo quy định.</p>
              )}

              {/* Display and allow selection of Available Schedules */}
              {availableSchedules.length > 0 && (
                <div className="new-schedule-options">
                  <h3>Chọn lịch thi mới:</h3>
                  <div className="schedule-list">
                      {/* Map through the available schedules array */}
                      {availableSchedules.map(schedule => (
                        <button
                          key={schedule.idlichthi} // Unique key for list rendering
                          onClick={() => handleSelectNewSchedule(schedule.idlichthi)} // Attach click handler
                          // Apply 'selected' class if this schedule's ID matches the selected ID state
                          className={`schedule-button ${selectedNewScheduleId === schedule.idlichthi ? 'selected' : ''}`}
                          disabled={isLoading} // Disable selection buttons while confirming
                        >
                          {/* Display schedule details (Date, Time, Location) */}
                          {/* Format date to Vietnamese locale, slice time to HH:MM */}
                          {`${new Date(schedule.ngaythi).toLocaleDateString('vi-VN')} ${schedule.giothi ? schedule.giothi.substring(0, 5) : 'N/A'}`} - {schedule.diadiem || 'N/A'}
                        </button>
                      ))}
                  </div>
                   {/* Prompt user to select if options are available but none selected */}
                  {!selectedNewScheduleId && <p className="selection-prompt">Vui lòng chọn một lịch thi từ danh sách trên để xác nhận.</p>}
                </div>
              )}

               {/* Message if *no* available dates were found by backend */}
               {availableSchedules.length === 0 && (
                   <p className="info-message">Không tìm thấy lịch thi mới phù hợp nào có chỗ trống.</p>
               )}

              {/* Button to trigger the confirmation of the reschedule */}
              <button
                onClick={handleExtend} // Attach handler
                className="extend-button extend-submit-button" // Apply CSS class
                 // Disable button while loading, if the initial check was not successful,
                 // or if schedules were presented but none was selected.
                disabled={
                    isLoading ||
                    !checkResult.success ||
                    (availableSchedules.length > 0 && !selectedNewScheduleId)
                }
              >
                {/* Button text changes based on loading state */}
                {loadingConfirm ? 'Đang xác nhận...' : 'Xác nhận gia hạn'}
              </button>
            </div>
          ) : (
            // Display message if the initial check result indicates the request is not eligible
            // The specific reason is shown in the {error} message area above.
            <p><strong>Trạng thái:</strong> Không hợp lệ để gia hạn.</p>
          )}
        </div>
      )}

    </div>
  );
}

export default ExtendTest;