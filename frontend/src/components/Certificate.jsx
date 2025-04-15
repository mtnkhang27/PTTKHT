import React, { useState, useEffect } from 'react';
import '../styles/Certificate.css';

function Certificate() {
  const [examId, setExamId] = useState('');
  const [certificateInfo, setCertificateInfo] = useState(null);
  const [error, setError] = useState(null);
  const [allCertificates, setAllCertificates] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAllCertificates = async () => {
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/api/certificates/`);
        if (!response.ok) {
          setError('Lỗi khi lấy danh sách chứng chỉ.');
          return;
        }
        const data = await response.json();
        setAllCertificates(data);
      } catch (error) {
        console.error('Lỗi khi gọi API lấy danh sách:', error);
        setError('Lỗi kết nối đến máy chủ.');
      }
    };

    fetchAllCertificates();
  }, [apiUrl]);

  const handleCheckCertificate = async () => {
    setError(null);
    setCertificateInfo(null);

    try {
      const response = await fetch(`${apiUrl}/api/certificates/${examId}`);
      if (!response.ok) {
        setError(response.status === 404 ? 'Không tìm thấy thông tin.' : 'Lỗi khi lấy thông tin.');
        return;
      }
      const data = await response.json();
      setCertificateInfo(data);
    } catch (error) {
      console.error('Lỗi gọi API:', error);
      setError('Lỗi kết nối máy chủ.');
    }
  };

  const handleReceiveCertificate = async (sobaodanhToConfirm) => {
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/certificates/${sobaodanhToConfirm}/confirm`, {
        method: 'PUT',
      });
      if (!response.ok) {
        setError(`Lỗi khi xác nhận đã nhận cho mã ${sobaodanhToConfirm}.`);
        return;
      }
      // Update the allCertificates list to reflect the change
      setAllCertificates(prevCertificates =>
        prevCertificates.map(cert =>
          cert.sobaodanh === sobaodanhToConfirm ? { ...cert, xacnhannhanchungchi: true } : cert
        )
      );
      // If the confirmed certificate is the one being viewed in detail, update that too
      if (certificateInfo && certificateInfo.sobaodanh === sobaodanhToConfirm) {
        setCertificateInfo({ ...certificateInfo, xacnhannhanchungchi: true });
      }
    } catch (error) {
      console.error('Lỗi gọi API xác nhận nhận:', error);
      setError('Lỗi kết nối máy chủ.');
    }
  };

  return (
    <div className="certificate-container">
      <h1 className="certificate-title">Cấp Chứng Chỉ</h1>

      <div className="certificate-input-area">
        <input
          placeholder="Nhập mã kỳ thi để kiểm tra"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          className="certificate-input"
        />
        <button onClick={handleCheckCertificate} className="certificate-button">Kiểm tra chứng chỉ</button>
      </div>

      {error && <p className="certificate-error">{error}</p>}

      {certificateInfo && (
        <div className="certificate-info">
          <h2 className="certificate-info-title">Thông tin chi tiết</h2>
          <p>Mã kỳ thi: {certificateInfo.sobaodanh}</p>
          <p>Kết quả: {certificateInfo.ketQuaThi}</p>
          <p>Ngày nhận dự kiến: {certificateInfo.thoiGianNhanChungChi ? new Date(certificateInfo.thoiGianNhanChungChi).toLocaleDateString() : 'Chưa có'}</p>
          <p>Trạng thái thanh toán: {certificateInfo.trangThaiThanhToan || 'Chưa rõ'}</p>
          <p>Đã nhận: {certificateInfo.xacnhannhanchungchi ? 'Rồi' : 'Chưa'}</p>
          <p>Hình thức nhận: Tại trung tâm</p>
          {!certificateInfo.xacnhannhanchungchi && (
            <button onClick={() => handleReceiveCertificate(certificateInfo.sobaodanh)} className="certificate-receive-button">
              Xác nhận đã nhận
            </button>
          )}
        </div>
      )}

      <h2 className="certificate-list-title">Danh sách chứng chỉ đã đăng ký</h2>
      {allCertificates.length > 0 ? (
        <table className="certificate-table">
          <thead>
            <tr>
              <th>Mã kỳ thi</th>
              <th>Mã phiếu đăng ký</th>
              <th>Mã lịch thi</th>
              <th>Kết quả</th>
              <th>Điểm số</th>
              <th>Ngày nhận dự kiến</th>
              <th>Đã nhận</th>
              <th>Hành động</th> {/* New column for the button */}
            </tr>
          </thead>
          <tbody>
            {allCertificates.map(cert => (
              <tr key={cert.sobaodanh}>
                <td>{cert.sobaodanh}</td>
                <td>{cert.idphieudangky}</td>
                <td>{cert.idlichthi}</td>
                <td>{cert.ketQuaThi}</td>
                <td>{cert.diemSoThi}</td>
                <td>{cert.thoiGianNhanChungChi ? new Date(cert.thoiGianNhanChungChi).toLocaleDateString() : 'Chưa có'}</td>
                <td>{cert.xacnhannhanchungchi ? 'Rồi' : 'Chưa'}</td>
                <td>
                  {!cert.xacnhannhanchungchi && (
                    <button
                      onClick={() => handleReceiveCertificate(cert.sobaodanh)}
                      className="certificate-receive-button small-button" // Optional: Add a small-button class for styling
                    >
                      Xác nhận
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>{error || 'Không có chứng chỉ nào được tìm thấy.'}</p>
      )}
    </div>
  );
}

export default Certificate;