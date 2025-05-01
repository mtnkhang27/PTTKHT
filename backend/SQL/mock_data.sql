-- Mock data for KhachHang
INSERT INTO khachhang (idkhachhang, loaikhachhang, tenkhachhang, email, sdt, diachi) VALUES
(1, 'Ca nhan', 'Nguyen Van A', 'a.nguyen@example.com', '0901234567', '123 Le Loi, Q1, TP.HCM'),
(2, 'Don vi', 'Cong ty TNHH ABC', 'info@abccorp.vn', '02812345678', '456 Nguyen Trai, Q5, TP.HCM'),
(3, 'Ca nhan', 'Tran Thi B', 'b.tran@sample.org', '0933445566', '789 Hai Ba Trung, Q3, TP.HCM'),
(4, 'Ca nhan', 'Le Van C', 'c.le@domain.net', '0977889900', '10 Vo Van Tan, Q.Tan Binh, TP.HCM'),
(5, 'Don vi', 'To chuc XYZ', 'contact@xyz.edu.vn', '02498765432', '22 Dien Bien Phu, Q.Binh Thanh, TP.HCM');

-- Mock data for NhanVien
INSERT INTO nhanvien (idnhanvien, tennhanvien, loainhanvien, trangthai, password) VALUES
(101, 'Pham Thi Diem', 'Tiep tan', 'Active', 'password123'),
(102, 'Hoang Van Hung', 'Quan ly', 'Active', 'securepass'),
(103, 'Nguyen Duc Manh', 'Giao vu', 'Active', 'manh123'),
(104, 'Le Thu Trang', 'Cham thi', 'Active', 'trang00'),
(105, 'Vo Minh Tuan', 'Ke toan', 'Active', 'tuanvo');

-- Mock data for ChungChi
INSERT INTO chungchi (idchungchi, tenchungchi, lephithi) VALUES
(201, 'TOEIC', 1500000.00),
(202, 'IELTS', 4500000.00),
(203, 'MOS', 500000.00),
(204, 'Tin hoc van phong', 300000.00),
(205, 'Tieng Anh tre em', 800000.00);

-- Mock data for PhongThi
INSERT INTO phongthi (idphong, succhua, sochotrong) VALUES
(301, 30, 25),
(302, 20, 18),
(303, 40, 35),
(304, 25, 22),
(305, 35, 30);

-- Mock data for DonViChamThi
INSERT INTO donvichamthi (iddonvi, tendonvi) VALUES
(401, 'Hoi dong thi ABC'),
(402, 'Trung tam XYZ'),
(403, 'So Giao duc TPHCM');

-- Mock data for PhieuDangKy
INSERT INTO phieudangky (idphieudangky, idkhachhang, nhanvientiepnhan, ngaydangky, trangthai) VALUES
(501, 1, 101, '2025-03-15', 'Da tiep nhan'),
(502, 2, 101, '2025-05-01', 'Da tiep nhan'),
(503, 3, 101, '2025-03-25', 'Da tiep nhan'),
(504, 4, 101, '2025-04-01', 'Da tiep nhan'),
(505, 5, 101, '2025-04-05', 'Da tiep nhan');


-- Mock data for LichThi
INSERT INTO lichthi (idlichthi, ngaythi, giothi, diadiem, idphong, nhanviencoithi, chungchithi) VALUES
(601, '2025-04-20', '08:00:00', 'Phong 301, 123 Le Loi', 301, 103, 201),
(602, '2025-04-20', '14:00:00', 'Phong 302, 123 Le Loi', 302, 103, 202),
(603, '2025-04-25', '09:00:00', 'Phong 303, 456 Nguyen Trai', 303, 103, 203),
(604, '2025-04-25', '15:00:00', 'Phong 304, 456 Nguyen Trai', 304, 103, 204),
(605, '2025-04-27', '10:00:00', 'Phong 305, 789 Hai Ba Trung', 305, 103, 205);


-- Mock data for PhieuGiaHan
INSERT INTO phieugiahan (idphieudangky, ngaygiahan, nhanviengiahan, lichthimoi, phigiahan, trangthaithanhtoan) VALUES
(501, '2025-04-10', 102, 602, 200000.00, 'Da thanh toan'),
(503, '2025-04-15', 102, 605, 150000.00, 'Chua thanh toan');

-- Mock data for PhieuDangKyDonVi
INSERT INTO phieudangkydonvi (idphieudangky, soluongthisinh, giamgia) VALUES
(502, 10, 0.05),
(505, 5, 0.02);

-- Mock data for QuyDinhTrungTam
INSERT INTO quydinhtrungtam (idquydinh, mota) VALUES
(701, 'Quy dinh ve viec gia han phieu dang ky thi.'),
(702, 'Quy dinh ve chinh sach giam gia cho don vi dang ky so luong lon.');

-- Mock data for ChungChiDangKy
INSERT INTO chungchidangky (idphieudangky, idchungchi) VALUES
(501, 201),
(502, 202),
(502, 203),
(503, 204),
(504, 201),
(505, 205);

-- Mock data for PhieuDuThi
INSERT INTO phieuduthi (sobaodanh, idphieudangky, idlichthi, iddonvi, nhanvienghinhandiem, ketquathi, diemsothi, thoigiannhanchungchi, xacnhannhanchungchi, ngaysinhts, tenthisinh) VALUES
(801, 501, 601, 401, 104, 'Dat', 78.5, '2025-05-10', true, '2000-03-15', 'Nguyen Van A'),
(802, 502, 602, 402, 104, 'Khong dat', 45.0, NULL, false, '1999-11-20', 'Tran Thi B'),
(803, 503, 603, 401, 104, 'Dat', 85.2, '2025-05-15', true, '2001-07-01', 'Le Hoang C'),
(804, 504, 601, 403, 104, 'Dat', 60.0, NULL, false, '2002-05-10', 'Pham Ngoc D'),
(805, 505, 605, 402, 104, 'Dat', 90.1, '2025-05-20', true, '2000-12-25', 'Hoang Minh E');

--UPDATE phieuduthi
--SET ngaysinhts = '2000-03-15', tenthisinh = 'Nguyen Van A'
--WHERE sobaodanh = 801;
--
--UPDATE phieuduthi
--SET ngaysinhts = '1999-11-20', tenthisinh = 'Tran Thi B'
--WHERE sobaodanh = 802;
--
--UPDATE phieuduthi
--SET ngaysinhts = '2001-07-01', tenthisinh = 'Le Hoang C'
--WHERE sobaodanh = 803;
--
--UPDATE phieuduthi
--SET ngaysinhts = '2002-05-10', tenthisinh = 'Pham Ngoc D'
--WHERE sobaodanh = 804;
--
--UPDATE phieuduthi
--SET ngaysinhts = '2000-12-25', tenthisinh = 'Hoang Minh E'
--WHERE sobaodanh = 805;

-- Mock data for HoaDon
INSERT INTO hoadon (idhoadon, idphieudangky, ngaythanhtoan, tongtien, nhanvienlaphoadon, trangthai) VALUES
(901, 501, '2025-03-15', 1500000.00, 105, 'Da thanh toan'),
(902, 502, '2025-03-20', 4750000.00, 105, 'Da thanh toan'),
(903, 503, '2025-03-25', 300000.00, 105, 'Da thanh toan'),
(904, 504, '2025-04-01', 1500000.00, 105, 'Chua thanh toan'),
(905, 505, '2025-04-05', 784000.00, 105, 'Da thanh toan');
