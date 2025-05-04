// components/Payment.jsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import { useLocation } from 'react-router-dom'; // Import useLocation
import '../styles/Payment.css'; // Ensure this CSS file is updated

function Payment() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const location = useLocation();

  const [registrationId, setRegistrationId] = useState(location.state?.registrationId || '');

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isUnit, setIsUnit] = useState(false);
  const [unitPaymentDetails, setUnitPaymentDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [error, setError] = useState(null); // Added error state
  const [successMessage, setSuccessMessage] = useState(null); // Added success state

 
  useEffect(() => {
    // Optional: Auto-check if needed, commented out as per original
    // if (registrationId && !paymentInfo) {
    //   handleCheckPayment();
    // }
  }, [registrationId, paymentInfo]); // Depend on registrationId and paymentInfo

  // --- Handler Functions (handleDownloadInvoice, handleCheckPayment, etc.) remain the same ---
  // ... (Keep all your existing handler functions here: handleDownloadInvoice, handleCheckPayment, handleCreateInvoice, handleCreateInvoiceIndividual, handlePayment) ...
  // --- Make sure to update alert calls to maybe use setError or setSuccessMessage if you prefer inline messages over alerts ---
  // Example change in handleCheckPayment error handling:
  // ... catch block in handleCheckPayment
  // } catch (err) {
  //   console.error('Error during payment check:', err);
  //   setError('Lỗi khi kiểm tra thanh toán. Vui lòng thử lại.'); // Use setError state
  //   // Reset other states
  //   setPaymentInfo(null);
  //   setIsUnit(false);
  //   // ... reset other states ...
  // }

    const handleDownloadInvoice = async () => {
    // Check if invoiceDetails and mahoadon exist before attempting download
    if (!invoiceDetails || !invoiceDetails.mahoadon) {
        // Use setError or an alert
        setError('Không có thông tin hóa đơn để tải.');
        // alert('Không có thông tin hóa đơn để tải.');
        return;
    }
    setError(null); // Clear previous errors

    try {
      const response = await fetch(`${apiUrl}/api/payment/download-invoice/${invoiceDetails.mahoadon}`, {
        method: 'GET', // Assuming GET is appropriate, adjust if needed
        headers: {
            // Add any necessary headers like Authorization if required
        },
      });

      if (!response.ok) {
        let errorMsg = `Lỗi ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
        } catch (jsonError) {
            // If the response isn't JSON, try getting text
            try {
                const errorText = await response.text();
                if (errorText) errorMsg += ` - ${errorText}`;
            } catch (textError) {
                // Ignore if text cannot be read
            }
        }
        setError(`Lỗi khi tải hóa đơn. ${errorMsg}`);
        // alert(`Lỗi khi tải hóa đơn. ${errorMsg}`);
        return;
      }

      const blob = await response.blob();
      // Check if the blob type indicates an error (e.g., application/json instead of application/pdf)
      if (blob.type.includes('application/json')) {
          const errorText = await blob.text();
          let errorData = {};
          try {
              errorData = JSON.parse(errorText);
          } catch(e) {/* Ignore parse error */}
          setError(errorData.error || 'Lỗi khi tải hóa đơn: Backend trả về thông tin lỗi thay vì file.');
          // alert(errorData.error || 'Lỗi khi tải hóa đơn: Backend trả về thông tin lỗi thay vì file.');
          return;
      } else if (!blob.type.includes('application/pdf')) {
          // Optional: Warn if the type is not PDF, but proceed anyway
          console.warn(`Received unexpected content type: ${blob.type}`);
      }


      const fileUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = `${invoiceDetails.mahoadon}.pdf`; // Suggest filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(fileUrl);
      setSuccessMessage('Đã bắt đầu tải hóa đơn.'); // Optional success feedback

    } catch (err) {
      console.error('Error during invoice download:', err);
      setError('Lỗi kết nối khi tải hóa đơn. Vui lòng thử lại.');
    //   alert('Lỗi kết nối khi tải hóa đơn. Vui lòng thử lại.');
    }
  };

  const handleCheckPayment = async () => {
     // Basic client-side validation
     if (!registrationId) {
         setError('Vui lòng nhập mã phiếu đăng ký.'); // Use setError
         // alert('Vui lòng nhập mã phiếu đăng ký.');
         return;
     }
     // Clear previous state before fetching
     setError(null);
     setSuccessMessage(null);
     setPaymentInfo(null);
     setIsUnit(false);
     setUnitPaymentDetails(null);
     setPaymentMethod('');
     setInvoiceCreated(false);
     setInvoiceDetails(null);
     setPaymentStatus('');

     try {
       const response = await fetch(`${apiUrl}/api/payment/check/${registrationId}`);
       const data = await response.json();

       if (response.ok) {
         setPaymentInfo(data);
         setIsUnit(data.isUnit || false);
         // Reset dependent states
         setPaymentMethod('');
         setInvoiceCreated(false);
         setInvoiceDetails(null);
         setPaymentStatus('');

         if (data.isUnit) {
           setUnitPaymentDetails({
             totalFee: data.totalFee,
             discount: data.discount,
             finalFee: data.finalFee,
           });
         }
         // No specific action needed for non-unit here unless defaulting payment method etc.

       } else {
         // Handle error response using setError
         setError(data.error || 'Không tìm thấy thông tin thanh toán hoặc đã có lỗi xảy ra.');
         // Clear potentially partially set info
         setPaymentInfo(null);
         setIsUnit(false);
         setUnitPaymentDetails(null);
       }
     } catch (err) {
       console.error('Error during payment check:', err);
       setError('Lỗi kết nối khi kiểm tra thanh toán. Vui lòng thử lại.');
       // Ensure state is cleared on network error
       setPaymentInfo(null);
       setIsUnit(false);
       setUnitPaymentDetails(null);
     }
   };

    const handleCreateInvoice = async () => {
        setError(null); // Clear previous errors
        setSuccessMessage(null);

        if (!paymentMethod) {
            setError('Vui lòng chọn hình thức thanh toán');
            // alert('Vui lòng chọn hình thức thanh toán');
            return;
        }

        if (!paymentInfo) {
            setError('Vui lòng kiểm tra thông tin thanh toán trước khi lập hóa đơn.');
            // alert('Vui lòng kiểm tra thông tin thanh toán trước khi lập hóa đơn.');
            return;
        }

        // Determine total amount based on isUnit
        const totalAmount = isUnit
            ? unitPaymentDetails?.finalFee
            : paymentInfo?.lephithiList?.[0]?.feePerCandidate; // Correctly access fee for non-unit

        // Validate totalAmount more robustly
        if (typeof totalAmount !== 'number' || totalAmount < 0) {
            console.error("Invalid total amount:", totalAmount, "isUnit:", isUnit, "Details:", unitPaymentDetails, "Info:", paymentInfo);
            setError('Không xác định được tổng tiền hợp lệ để lập hóa đơn.');
            // alert('Không xác định được tổng tiền hợp lệ để lập hóa đơn.');
            return;
        }


        try {
            const response = await fetch(`${apiUrl}/api/payment/create-invoice/${registrationId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentMethod,
                    // registrationId, // Often redundant if in URL, but harmless
                    totalAmount: totalAmount,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setInvoiceCreated(true);
                setInvoiceDetails(data.invoice);
                setSuccessMessage('Hóa đơn đã được lập thành công.'); // Use success message state
                // alert('Hóa đơn đã được lập thành công.');
            } else {
                setError(data.error || 'Không thể lập hóa đơn');
                // alert(data.error || 'Không thể lập hóa đơn');
            }
        } catch (err) {
            console.error('Error during invoice creation:', err);
            setError('Lỗi kết nối khi lập hóa đơn. Vui lòng thử lại.');
            // alert('Lỗi kết nối khi lập hóa đơn. Vui lòng thử lại.');
        }
    };

     const handleCreateInvoiceIndividual = async () => {
        setError(null); // Clear previous errors
        setSuccessMessage(null);

        if (!paymentInfo) {
            setError('Vui lòng kiểm tra thông tin thanh toán trước khi lập hóa đơn.');
            // alert('Vui lòng kiểm tra thông tin thanh toán trước khi lập hóa đơn.');
            return;
        }

        // Correctly access fee for non-unit/individual case
        const totalAmount = paymentInfo?.lephithiList?.[0]?.feePerCandidate;

        if (typeof totalAmount !== 'number' || totalAmount < 0) {
             console.error("Invalid total amount for individual:", totalAmount, "Info:", paymentInfo);
             setError('Không xác định được tổng tiền hợp lệ để lập hóa đơn.');
            // alert('Không xác định được tổng tiền hợp lệ để lập hóa đơn.');
            return;
        }

        try {
             // Use 'transfer' as the default method for individual, or make it selectable if needed
            const fixedPaymentMethod = 'transfer';

            const response = await fetch(`${apiUrl}/api/payment/create-invoice/${registrationId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentMethod: fixedPaymentMethod,
                    totalAmount: totalAmount,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setInvoiceCreated(true);
                setInvoiceDetails(data.invoice);
                setPaymentMethod(fixedPaymentMethod); // Set the payment method state as well
                setSuccessMessage('Hóa đơn đã được lập thành công.'); // Use success message state
                // alert('Hóa đơn đã được lập thành công.');
            } else {
                setError(data.error || 'Không thể lập hóa đơn');
                // alert(data.error || 'Không thể lập hóa đơn');
            }
        } catch (err) {
            console.error('Error during individual invoice creation:', err);
            setError('Lỗi kết nối khi lập hóa đơn. Vui lòng thử lại.');
            // alert('Lỗi kết nối khi lập hóa đơn. Vui lòng thử lại.');
        }
    };

    const handlePayment = async () => {
        setError(null); // Clear previous errors
        setSuccessMessage(null);

        if (!paymentInfo) {
            setError('Vui lòng kiểm tra thông tin thanh toán trước khi xác nhận.');
            // alert('Vui lòng kiểm tra thông tin thanh toán trước khi xác nhận.');
            return;
        }

        // Check if invoice is required and created
        // For individual ('transfer' method implicitly requires invoice now)
        // For unit (requires selection and invoice creation)
        if (!invoiceCreated) {
             setError('Vui lòng lập hóa đơn trước khi xác nhận thanh toán.');
            //  alert('Vui lòng lập hóa đơn trước khi xác nhận thanh toán.');
             return;
        }

        // For unit payments, ensure a method was selected *before* invoice creation.
        // For individual, 'transfer' is assumed. Check paymentMethod state.
        if (!paymentMethod) {
             setError('Hình thức thanh toán chưa được xác định.');
            //  alert('Hình thức thanh toán chưa được xác định.');
             return;
        }

        // Prevent confirming if already paid
        if (paymentInfo.status === 'Paid') {
            setError('Phiếu đăng ký này đã được thanh toán.');
            // alert('Phiếu đăng ký này đã được thanh toán.');
            return;
        }


        try {
            const response = await fetch(`${apiUrl}/api/payment/confirm/${registrationId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Confirm endpoint might not need the method if it's stored with the invoice
                // Send it just in case, or remove if backend doesn't use it
                body: JSON.stringify({ method: paymentMethod }),
            });

            const data = await response.json();

            if (response.ok) {
                setPaymentStatus(data.message || 'Thanh toán thành công'); // Update status message
                setSuccessMessage(data.message || 'Thanh toán thành công!'); // Use success state for feedback
                // alert(data.message || 'Thanh toán thành công!');
                // Optionally update paymentInfo state to reflect 'Paid' status
                setPaymentInfo(prev => prev ? { ...prev, status: 'Paid' } : null);
                // Optionally clear/reset form after success?
                // setRegistrationId(''); setPaymentInfo(null); ... etc.
            } else {
                setError(data.error || 'Đã xảy ra lỗi khi xác nhận thanh toán.');
                // alert(data.error || 'Đã xảy ra lỗi khi xác nhận thanh toán.');
                setPaymentStatus(''); // Clear status on error
            }
        } catch (err) {
            console.error('Error during payment confirmation:', err);
            setError('Lỗi kết nối khi xác nhận thanh toán. Vui lòng thử lại.');
            // alert('Lỗi kết nối khi xác nhận thanh toán. Vui lòng thử lại.');
            setPaymentStatus(''); // Clear status on error
        }
    };


  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'N/A'; // More robust check
    return `${amount.toLocaleString('vi-VN')} VNĐ`;
  };

  return (
    <div className="payment-container">
      <h1 className="payment-title">Thanh Toán và Phiếu Dự Thi</h1>

      {/* --- Input Area --- */}
      {/* Add margin-bottom in CSS */}
      <div className="payment-input-area">
        <input
          placeholder="Nhập mã phiếu đăng ký"
          value={registrationId}
          onChange={(e) => setRegistrationId(e.target.value)}
          className="payment-input"
          // Disable input if paymentInfo is loaded to prevent changing mid-process
          disabled={!!paymentInfo}
        />
        {/* Button Group: Use flex and gap in CSS for spacing */}
        <div className="payment-input-buttons">
          <button
            onClick={handleCheckPayment}
            className="payment-button"
            // Disable check button if input is empty or paymentInfo is loaded
            disabled={!registrationId || !!paymentInfo}
          >
            Kiểm tra
          </button>
          {/* Option to clear and start over */}
          {paymentInfo && (
            <button
              onClick={() => {
                setRegistrationId('');
                setPaymentInfo(null);
                setIsUnit(false);
                setUnitPaymentDetails(null);
                setPaymentMethod('');
                setInvoiceCreated(false);
                setInvoiceDetails(null);
                setPaymentStatus('');
                setError(null); // Clear errors
                setSuccessMessage(null); // Clear success messages
              }}
              className="payment-button secondary-button" // Style differently
            >
              Nhập mã khác
            </button>
          )}
        </div>
      </div>

      {/* --- Message Area --- */}
      {/* Use margin-top/bottom in CSS for spacing */}
      <div className="payment-message-area">
         {error && <p className="error-message">{error}</p>}
         {successMessage && <p className="success-message">{successMessage}</p>}
         {/* Display payment status if it's not indicating success/error already handled */}
         {paymentStatus && !successMessage && !error && (
             <p className="info-message">{paymentStatus}</p>
         )}
         {/* Initial instruction */}
         {!paymentInfo && !location.state?.registrationId && !error && !successMessage && (
           <p className="info-message">Vui lòng nhập mã phiếu đăng ký để kiểm tra thông tin thanh toán.</p>
         )}
      </div>


      {/* --- Payment Details Section (only when info is loaded) --- */}
      {paymentInfo && (
        // Add margin-top in CSS for spacing from input/message area
        <div className="payment-info-section">
          <h2 className="payment-info-title">Thông tin thanh toán</h2>

          {/* Basic Info */}
          {/* Add margin-bottom in CSS */}
          <div className="payment-basic-info">
            <p><strong>Mã phiếu:</strong> {paymentInfo.id}</p>
            <p><strong>Trạng thái:</strong> {paymentInfo.status}</p>
          </div>

          {/* Fee Details (Unit or Individual) */}
          {/* Add margin-top/bottom in CSS */}
          <div className="payment-fee-details">
            {isUnit && unitPaymentDetails ? (
              // Unit Specific Details
              <div className="unit-details-section">
                <h3 className="unit-details-title">Chi tiết phí (Đơn vị)</h3>
                <p>Tổng phí gốc: {formatCurrency(unitPaymentDetails.totalFee)}</p>
                <p>Giảm giá: {formatCurrency(unitPaymentDetails.discount)}</p>
                <p><strong>Phí cuối cùng: {formatCurrency(unitPaymentDetails.finalFee)}</strong></p>

                {/* Payment Method Selection for Unit */}
                {/* Add margin-top/bottom in CSS */}
                <div className="payment-method-group">
                  <label htmlFor="paymentMethod"><strong>Hình thức thanh toán:</strong></label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="payment-select"
                    // Disable method selection after invoice is created or if already paid
                    disabled={invoiceCreated || paymentInfo.status === 'Paid'}
                  >
                    <option value="">-- Chọn hình thức --</option>
                    <option value="cash">Tiền mặt</option>
                    <option value="transfer">Chuyển khoản</option>
                  </select>
                </div>
              </div>
            ) : (
               // Individual Specific Details (or non-unit)
               paymentInfo.lephithiList?.length > 0 && (
                <div className="individual-fees-list">
                    <h3 className='individual-details-title'>Chi tiết phí (Cá nhân)</h3>
                    {/* Display total fee first */}
                    <p><strong>Phí thanh toán:</strong> {formatCurrency(paymentInfo.lephithiList[0].feePerCandidate)}</p>
                    {/* Optional: Display breakdown if needed */}
                    {/* <ul>
                        {paymentInfo.lephithiList.map((feeItem, index) => (
                        <li key={index}>
                            {feeItem.tenchungchi || `Phí ${index + 1}`}: {formatCurrency(feeItem.subtotal || feeItem.feePerCandidate)}
                        </li>
                        ))}
                    </ul> */}
                </div>
              )
            )}
          </div>

          {/* Invoice Info (shown after creation) */}
          {/* Add margin-top/bottom in CSS */}
          {invoiceCreated && invoiceDetails && (
            <div className="invoice-info-section">
              <h3 className="invoice-info-title">Thông tin hóa đơn</h3>
              <p>Mã hóa đơn: <strong>{invoiceDetails.mahoadon}</strong></p>
              {/* Moved download button to actions area below */}
            </div>
          )}

          {/* --- Action Buttons Area --- */}
          {/* Add margin-top in CSS for spacing */}
          <div className="payment-actions-area">
            {/* Create Invoice Button (Conditional) */}
             {!invoiceCreated && paymentInfo.status !== 'Paid' && (
                <>
                 {isUnit && (
                    <button
                    onClick={handleCreateInvoice}
                    className="payment-button create-invoice-button"
                    disabled={!paymentMethod || !unitPaymentDetails} // Ensure method selected and details loaded
                    >
                    Lập hóa đơn (Đơn vị)
                    </button>
                 )}
                 {!isUnit && paymentInfo.lephithiList?.length > 0 && (
                    <button
                        onClick={handleCreateInvoiceIndividual}
                        className="payment-button create-invoice-button"
                        // Disabled if fee is not valid number
                        disabled={typeof paymentInfo.lephithiList[0]?.feePerCandidate !== 'number'}
                    >
                        Lập hóa đơn (Cá nhân - CK)
                    </button>
                 )}
                </>
             )}


            {/* Download Invoice Button (Conditional) */}
            {invoiceCreated && invoiceDetails && (
              <button
                onClick={handleDownloadInvoice}
                className="payment-button download-invoice-button"
              >
                Xem / Tải hóa đơn (PDF)
              </button>
            )}

            {/* Confirm Payment Button (Conditional) */}
            {/* Show if invoice is created (implicitly required now for both types) and not yet paid */}
            {invoiceCreated && paymentInfo.status !== 'Paid' && (
              <button
                onClick={handlePayment}
                className="payment-button confirm-payment-button"
              >
                Xác nhận thanh toán
              </button>
            )}
          </div>

        </div> // End payment-info-section
      )}

    </div> // End payment-container
  );
}

export default Payment;