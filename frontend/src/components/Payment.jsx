// components/Payment.jsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import { useLocation } from 'react-router-dom'; // Import useLocation
import '../styles/Payment.css';

function Payment() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const location = useLocation(); // Get location object to access state

  // Initialize registrationId state from navigation state if available
  const [registrationId, setRegistrationId] = useState(location.state?.registrationId || '');

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isUnit, setIsUnit] = useState(false);
  const [unitPaymentDetails, setUnitPaymentDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [error, setError] = useState(null);

  // Effect to automatically check payment info if registrationId is received via state
  useEffect(() => {
    // if (registrationId && !paymentInfo) { // Only check if ID exists and info hasn't been loaded yet
    //   handleCheckPayment();
    // }
  }, [registrationId, paymentInfo]); // Depend on registrationId and paymentInfo


  const handleDownloadInvoice = async () => {
    // Check if invoiceDetails and mahoadon exist before attempting download
    if (!invoiceDetails || !invoiceDetails.mahoadon) {
        alert('Không có thông tin hóa đơn để tải.');
        return;
    }

    try {
      // Note: The previous code was sending paymentMethod and totalAmount in the body
      // for the download endpoint, which is unusual for a GET or typically POST download.
      // A POST download usually just needs the identifier (mahoadon). Let's simplify
      // the request based on the endpoint path suggesting it only needs mahoadon.
      // If your backend *truly* needs paymentMethod/totalAmount for download,
      // keep the body, but verify the HTTP method. Assuming POST with just ID for now.

      const response = await fetch(`${apiUrl}/api/payment/download-invoice/${invoiceDetails.mahoadon}`, {
        method: 'GET', // Or GET if your backend supports it
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ // Keep this if your backend needs it
        //   paymentMethod, // This might not be necessary for a download
        //   totalAmount: isUnit
        //     ? unitPaymentDetails?.finalFee
        //     : paymentInfo?.feePerCandidate,
        // }),
      });

      if (!response.ok) {
        // If the response is JSON with an error message
        if (response.headers.get('Content-Type')?.includes('application/json')) {
           const errorData = await response.json();
           alert(errorData.error || 'Lỗi khi tải hóa đơn');
        } else {
           // If the response is not JSON (e.g., plain text error)
           const errorText = await response.text();
           alert(`Lỗi khi tải hóa đơn: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return;
      }

      // Assuming the backend sends the PDF file directly in the response body
      // This is the standard way to handle file downloads from a fetch request.
      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob); // Create a local URL for the blob

      // Create link and trigger download
      const a = document.createElement('a');
      a.href = fileUrl;
      // Suggest a filename. You might get the filename from response headers (Content-Disposition)
      // or construct it based on the mahoadon. Using mahoadon here.
      a.download = `${invoiceDetails.mahoadon}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the object URL
      URL.revokeObjectURL(fileUrl);

    } catch (err) {
      console.error('Error during invoice download:', err); // Log the error
      alert('Lỗi khi tải hóa đơn. Vui lòng thử lại.');
    }
  };

  const handleCheckPayment = async () => {
     // Basic client-side validation
     if (!registrationId) {
         alert('Vui lòng nhập mã phiếu đăng ký.');
         return;
     }
    try {
      const response = await fetch(`${apiUrl}/api/payment/check/${registrationId}`);
      const data = await response.json();

      if (response.ok) {
        setPaymentInfo(data);
        setIsUnit(data.isUnit || false);
        setPaymentMethod('');
        setInvoiceCreated(false); // Reset invoice state on new check
        setInvoiceDetails(null);   // Reset invoice state on new check
        setPaymentStatus('');      // Reset payment status on new check

        if (data.isUnit) {
          setUnitPaymentDetails({
            totalFee: data.totalFee,
            discount: data.discount,
            finalFee: data.finalFee,
          });
        } else {
            // For non-unit payments, if a fee is present, maybe default method or prepare for direct payment?
            // Depending on your payment flow for non-units.
            // For now, just setting the fee info is enough.
        }
      } else {
        // Handle error response
        alert(data.error || 'Không tìm thấy thông tin thanh toán hoặc đã có lỗi xảy ra.');
        setPaymentInfo(null); // Clear previous info on error
        setIsUnit(false);
        setUnitPaymentDetails(null);
        setPaymentMethod('');
        setInvoiceCreated(false);
        setInvoiceDetails(null);
        setPaymentStatus('');
      }
    } catch (err) {
      console.error('Error during payment check:', err); // Log the error
      alert('Lỗi khi kiểm tra thanh toán. Vui lòng thử lại.');
      setPaymentInfo(null); // Clear previous info on error
      setIsUnit(false);
      setUnitPaymentDetails(null);
      setPaymentMethod('');
      setInvoiceCreated(false);
      setInvoiceDetails(null);
      setPaymentStatus('');
    }
  };

  const handleCreateInvoice = async () => {
    if (!paymentMethod) {
      alert('Vui lòng chọn hình thức thanh toán');
      return;
    }

    // Ensure paymentInfo is loaded and contains necessary fee details
    if (!paymentInfo) {
         alert('Vui lòng kiểm tra thông tin thanh toán trước khi lập hóa đơn.');
         return;
    }

    const totalAmount = isUnit
      ? unitPaymentDetails?.finalFee
      : paymentInfo?.lephithiList?.[0]; // Assuming the first fee in the list is the relevant one for non-unit case

    if (totalAmount === undefined || totalAmount === null) {
         alert('Không xác định được tổng tiền để lập hóa đơn.');
         return;
    }


    try {
      const response = await fetch(`${apiUrl}/api/payment/create-invoice/${registrationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          registrationId, // Redundant in path, but harmless to send
          totalAmount: totalAmount, // Use the determined total amount
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setInvoiceCreated(true);
        setInvoiceDetails(data.invoice);
        alert('Hóa đơn đã được lập thành công.'); // Inform the user
        // console.log(data.invoice); // Keep for debugging if needed
      } else {
        alert(data.error || 'Không thể lập hóa đơn');
      }
    } catch (err) {
      console.error('Error during invoice creation:', err); // Log the error
      alert('Lỗi khi lập hóa đơn. Vui lòng thử lại.');
    }
  };


  const handlePayment = async () => {
      // Ensure paymentInfo is loaded
      if (!paymentInfo) {
         alert('Vui lòng kiểm tra thông tin thanh toán trước khi xác nhận.');
         return;
      }

      // Check if invoice is needed and created for unit cases
      if (isUnit && !invoiceCreated) {
          alert('Vui lòng lập hóa đơn trước khi xác nhận thanh toán cho đơn vị.');
          return;
      }

      // Check if payment method is selected (needed for invoice creation too, but good to double check)
      if (isUnit && !paymentMethod) { // Assuming payment method is primarily needed for unit/invoice flow
           alert('Vui lòng chọn hình thức thanh toán.');
           return;
      }


    try {
      const response = await fetch(`${apiUrl}/api/payment/confirm/${registrationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Assuming the confirm endpoint *might* need the method, but maybe not always.
        // Only send if paymentMethod is selected/relevant.
        body: JSON.stringify({ method: paymentMethod || undefined }), // Send method if available
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentStatus(data.message || 'Thanh toán thành công');
        alert(data.message || 'Thanh toán thành công!'); // Show alert
        // Optionally reset state or redirect after successful payment
        // setRegistrationId('');
        // setPaymentInfo(null);
        // ... etc ...
      } else {
        alert(data.error || 'Đã xảy ra lỗi khi xác nhận thanh toán.');
        setPaymentStatus(''); // Clear status on error
      }
    } catch (err) {
      console.error('Error during payment confirmation:', err); // Log the error
      alert('Lỗi khi xác nhận thanh toán. Vui lòng thử lại.');
      setPaymentStatus(''); // Clear status on error
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
      if (amount === undefined || amount === null) return 'N/A';
      return `${parseInt(amount).toLocaleString('vi-VN')} VNĐ`;
  }

  return (
    <div className="payment-container">
      <h1 className="payment-title">Thanh Toán và Phiếu Dự Thi</h1>

      <div className="payment-input-area">
        <input
          placeholder="Nhập mã phiếu đăng ký"
          value={registrationId}
          onChange={(e) => setRegistrationId(e.target.value)}
          className="payment-input"
          // Disable input if paymentInfo is already loaded (prevents changing ID mid-process)
          disabled={!!paymentInfo}
        />
        <button
          onClick={handleCheckPayment}
          className="payment-button"
          // Disable check button if input is empty or paymentInfo is already loaded
          disabled={!registrationId || !!paymentInfo}
        >
            Kiểm tra
        </button>
         {/* Option to clear and start over if paymentInfo is loaded */}
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
                     setError(null); // Clear any previous errors
                     setSuccessMessage(null); // Clear any previous messages
                 }}
                 className="payment-button secondary-button" // Use a secondary style for clarity
             >
                 Nhập mã khác
             </button>
        )}
      </div>

       {/* Display general messages (Error, Success Status) */}
       {/* Reusing message classes from ExtendTest CSS if available */}
       {paymentStatus && (
            <div className="payment-message-area"> {/* New container for messages */}
                 <p className={paymentStatus.includes('thành công') ? 'success-message' : 'info-message'}>
                    {paymentStatus}
                 </p>
             </div>
       )}
        {error && ( // Assuming you might want a general error state in Payment too
            <div className="payment-message-area">
                <p className="error-message">{error}</p>
            </div>
        )}


      {paymentInfo && (
        <div className="payment-info-section"> {/* New container for payment info details */}
          <h2 className="payment-info-title">Thông tin thanh toán</h2> {/* Reusing title class */}
          <p><strong>Mã phiếu:</strong> {paymentInfo.id}</p>
          <p><strong>Trạng thái:</strong> {paymentInfo.status}</p>

          {/* Display fee details - adjusted based on isUnit */}
          {/* {!isUnit && paymentInfo.lephithiList?.length > 0 && (
             <p><strong>Phí thanh toán:</strong> {formatCurrency(paymentInfo.lephithiList[0])}</p>
          )} */}
         {!isUnit && paymentInfo.lephithiList?.length > 0 && (
             <p><strong>Phí thanh toán:</strong> {formatCurrency(paymentInfo.lephithiList[0].feePerCandidate)}</p>
          )}

          {isUnit && unitPaymentDetails ? (
            <div className="unit-details-section"> {/* New container for unit details */}
              <h3 className="unit-details-title">Ưu đãi đơn vị</h3>
              <p>Tổng phí: {formatCurrency(unitPaymentDetails.totalFee)}</p>
              <p>Giảm giá: {formatCurrency(unitPaymentDetails.discount)}</p>
              <p><strong>Phí cuối cùng: {formatCurrency(unitPaymentDetails.finalFee)}</strong></p>

              <div className="payment-method-group"> {/* New container for payment method select */}
                <label htmlFor="paymentMethod"><strong>Hình thức thanh toán:</strong></label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="payment-select"
                  disabled={invoiceCreated} // Disable method selection after invoice created
                >
                  <option value="">-- Chọn hình thức --</option>
                  <option value="cash">Tiền mặt</option>
                  <option value="transfer">Chuyển khoản</option>
                </select>
              </div>

              {!invoiceCreated && (
                <button
                  onClick={handleCreateInvoice}
                  className="payment-button create-invoice-button" // Specific class for styling
                  disabled={!paymentMethod} // Disable if method not selected
                >
                  Lập hóa đơn
                </button>
              )}
            </div>
          ) : (
              // Display list of fees even if not unit (if needed)
               paymentInfo.lephithiList?.length > 0 && (
                   <div className="individual-fees-list"> {/* New container for individual fees */}
                       <h3>Chi tiết phí:</h3>
                       <ul>
                         {paymentInfo.lephithiList.map((fee, index) => (
                           // Ensure fee is treated as number for formatting
                           console.log(fee),
                           <li key={index}>Chứng chỉ {fee.tenchungchi}: {formatCurrency(fee.subtotal)}</li>
                         ))}
                       </ul>
                   </div>
               )
          )}


          {invoiceCreated && invoiceDetails && (
            <div className="invoice-info-section"> {/* New container for invoice info */}
              <h3 className="invoice-info-title">Thông tin hóa đơn</h3>
              <p>Mã hóa đơn: <strong>{invoiceDetails.mahoadon}</strong></p>
              <button
                onClick={handleDownloadInvoice}
                className="payment-button download-invoice-button" // Specific class for styling
              >
                 Xem / Tải hóa đơn (PDF)
              </button>
            </div>
          )}

          {/* Confirm Payment Button */}
          {/* Enabled if paymentInfo is loaded and (either not unit OR (unit AND invoice created)) */}
          {paymentInfo && (!isUnit || (isUnit && invoiceCreated)) && (
            <button
              onClick={handlePayment}
              className="payment-button confirm-payment-button" // Specific class
              // Add additional disable logic if needed, e.g., requiring fee info exists
              disabled={!paymentInfo.status || paymentInfo.status === 'Paid'} // Example: Disable if status is Paid
            >
              Xác nhận thanh toán
            </button>
          )}

        </div>
      )}

        {/* Message when paymentInfo is null and not loading */}
       {!paymentInfo && !location.state?.registrationId && (
           <div className="payment-message-area">
               <p className="info-message">Vui lòng nhập mã phiếu đăng ký để kiểm tra thông tin thanh toán.</p>
           </div>
       )}

    </div>
  );
}

export default Payment;