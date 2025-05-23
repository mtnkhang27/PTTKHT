-- Table: KhachHang
CREATE TABLE IF NOT EXISTS KhachHang (
  IDKhachHang SERIAL NOT NULL PRIMARY KEY,
  LoaiKhachHang VARCHAR(255) NULL,
  TenKhachHang VARCHAR(255) NULL,
  Email VARCHAR(255) NULL,
  SDT VARCHAR(20) NULL,
  DiaChi VARCHAR(255) NULL
);

-- Table: NhanVien
CREATE TABLE IF NOT EXISTS NhanVien (
  IDNhanVien SERIAL NOT NULL PRIMARY KEY,
  TenNhanVien VARCHAR(255) NULL,
  LoaiNhanVien VARCHAR(255) NULL,
  TrangThai VARCHAR(255) NULL,
  Password VARCHAR(255) NULL
);

-- Table: ChungChi
CREATE TABLE IF NOT EXISTS ChungChi (
  IDChungChi SERIAL NOT NULL PRIMARY KEY,
  TenChungChi VARCHAR(255) NULL,
  LePhiThi DECIMAL(10, 2) NULL
);

-- Table: PhongThi
CREATE TABLE IF NOT EXISTS PhongThi (
  IDPhong SERIAL NOT NULL PRIMARY KEY,
  SucChua INT NULL,
  SoChoTrong INT NULL
);

-- Table: DonViChamThi
CREATE TABLE IF NOT EXISTS DonViChamThi (
  IDDonVi SERIAL NOT NULL PRIMARY KEY,
  TenDonVi VARCHAR(255) NULL
);

-- Table: PhieuDangKy
CREATE TABLE IF NOT EXISTS PhieuDangKy (
  IDPhieuDangKy SERIAL NOT NULL PRIMARY KEY,
  IDKhachHang INT NULL,
  NhanVienTiepNhan INT NULL,
  NgayDangKy DATE NULL,
  TrangThai VARCHAR(255) NULL
);

-- Table: LichThi
CREATE TABLE IF NOT EXISTS LichThi (
  IDLichThi SERIAL NOT NULL PRIMARY KEY,
  NgayThi DATE NULL,
  GioThi TIME NULL,
  DiaDiem VARCHAR(255) NULL,
  IDPhong INT NULL,
  NhanVienCoiThi INT NULL,
  ChungChiThi INT null,
  SoLuongThiSinhHienTai INT NULL
);

-- Table: PhieuGiaHan
CREATE TABLE IF NOT EXISTS PhieuGiaHan (
  IDPhieuDangKy SERIAL NOT NULL,
  NgayGiaHan DATE NOT NULL,
  NhanVienGiaHan INT NULL,
  LichThiMoi INT NULL,
  PhiGiaHan DECIMAL(10, 2) NULL,
  TrangThaiThanhToan VARCHAR(255) NULL,
  PRIMARY KEY (IDPhieuDangKy, LichThiMoi)
);

-- Table: PhieuDangKyDonVi
CREATE TABLE IF NOT EXISTS PhieuDangKyDonVi (
  IDPhieuDangKy SERIAL NOT NULL PRIMARY KEY,
  SoLuongThiSinh INT NULL,
  GiamGia DECIMAL(5, 2) NULL
);

-- Table: QuyDinhTrungTam
CREATE TABLE IF NOT EXISTS QuyDinhTrungTam (
  IDQuyDinh SERIAL NOT NULL PRIMARY KEY,
  MoTa TEXT NULL
);

-- Table: ChungChiDangKy
CREATE TABLE IF NOT EXISTS ChungChiDangKy (
  IDPhieuDangKy SERIAL NOT NULL,
  IDChungChi INT NOT NULL,
  PRIMARY KEY (IDPhieuDangKy, IDChungChi)
);

-- Table: PhieuDuThi
CREATE TABLE IF NOT EXISTS PhieuDuThi (
  SoBaoDanh SERIAL NOT NULL PRIMARY KEY,
  IDPhieuDangKy INT NULL,
  IDLichThi INT NULL,
  IDDonVi INT NULL,
  NhanVienGhiNhanDiem INT NULL,
  KetQuaThi VARCHAR(255) NULL,
  DiemSoThi FLOAT NULL,
  ThoiGianNhanChungChi DATE NULL,
  XacNhanNhanChungChi BOOLEAN null,
  TenThiSinh VARCHAR(255) null,
  NgaySinhTS DATE null
);

-- Table: HoaDon
CREATE TABLE IF NOT EXISTS HoaDon (
  IDHoaDon SERIAL NOT NULL PRIMARY KEY,
  IDPhieuDangKy INT NULL,
  NgayThanhToan DATE NULL,
  TongTien DECIMAL(13, 2) NULL,
  NhanVienLapHoaDon INT NULL,
  TrangThai VARCHAR(255) NULL,
  LoaiThanhToan VARCHAR(255) NULL
);

-- Adding Foreign Key Constraints

ALTER TABLE PhieuDangKy
ADD CONSTRAINT FK_PhieuDangKy_KhachHang FOREIGN KEY (IDKhachHang) REFERENCES KhachHang (IDKhachHang);

ALTER TABLE PhieuDangKy
ADD CONSTRAINT FK_PhieuDangKy_NhanVien FOREIGN KEY (NhanVienTiepNhan) REFERENCES NhanVien (IDNhanVien);

ALTER TABLE LichThi
ADD CONSTRAINT FK_LichThi_PhongThi FOREIGN KEY (IDPhong) REFERENCES PhongThi (IDPhong);

ALTER TABLE LichThi
ADD CONSTRAINT FK_LichThi_NhanVien FOREIGN KEY (NhanVienCoiThi) REFERENCES NhanVien (IDNhanVien);

ALTER TABLE LichThi
ADD CONSTRAINT FK_LichThi_ChungChi FOREIGN KEY (ChungChiThi) REFERENCES ChungChi (IDChungChi);

ALTER TABLE PhieuGiaHan
ADD CONSTRAINT FK_PhieuGiaHan_PhieuDangKy FOREIGN KEY (IDPhieuDangKy) REFERENCES PhieuDangKy (IDPhieuDangKy);

ALTER TABLE PhieuGiaHan
ADD CONSTRAINT FK_PhieuGiaHan_NhanVien FOREIGN KEY (NhanVienGiaHan) REFERENCES NhanVien (IDNhanVien);

ALTER TABLE PhieuGiaHan
ADD CONSTRAINT FK_PhieuGiaHan_LichThi FOREIGN KEY (LichThiMoi) REFERENCES LichThi (IDLichThi);

ALTER TABLE PhieuDangKyDonVi
ADD CONSTRAINT FK_PhieuDangKyDonVi_PhieuDangKy FOREIGN KEY (IDPhieuDangKy) REFERENCES PhieuDangKy (IDPhieuDangKy);

ALTER TABLE ChungChiDangKy
ADD CONSTRAINT FK_ChungChiDangKy_PhieuDangKy FOREIGN KEY (IDPhieuDangKy) REFERENCES PhieuDangKy (IDPhieuDangKy);

ALTER TABLE ChungChiDangKy
ADD CONSTRAINT FK_ChungChiDangKy_ChungChi FOREIGN KEY (IDChungChi) REFERENCES ChungChi (IDChungChi);

ALTER TABLE PhieuDuThi
ADD CONSTRAINT FK_PhieuDuThi_PhieuDangKy FOREIGN KEY (IDPhieuDangKy) REFERENCES PhieuDangKy (IDPhieuDangKy);

ALTER TABLE PhieuDuThi
ADD CONSTRAINT FK_PhieuDuThi_LichThi FOREIGN KEY (IDLichThi) REFERENCES LichThi (IDLichThi);

ALTER TABLE PhieuDuThi
ADD CONSTRAINT FK_PhieuDuThi_DonViChamThi FOREIGN KEY (IDDonVi) REFERENCES DonViChamThi (IDDonVi);

ALTER TABLE PhieuDuThi
ADD CONSTRAINT FK_PhieuDuThi_NhanVien FOREIGN KEY (NhanVienGhiNhanDiem) REFERENCES NhanVien (IDNhanVien);

ALTER TABLE HoaDon
ADD CONSTRAINT FK_HoaDon_PhieuDangKy FOREIGN KEY (IDPhieuDangKy) REFERENCES PhieuDangKy (IDPhieuDangKy);

ALTER TABLE HoaDon
ADD CONSTRAINT FK_HoaDon_NhanVien FOREIGN KEY (NhanVienLapHoaDon) REFERENCES NhanVien (IDNhanVien);

-- fix db
--ALTER TABLE LichThi
--DROP COLUMN SoLuongThiSinh;
--
--alter table phieuduthi 
--add column TenThiSinh VARCHAR(255) NULL;
--
--alter table phieuduthi 
--add column  NgaySinhTS DATE NULL;
--
--select * from phieuduthi p 

--alter table hoadon 
--add column LoaiThanhToan VARCHAR(255) null;

-- Alter LePhiThi in ChungChi to DECIMAL(10, 2) NULL
--ALTER TABLE ChungChi
--ALTER COLUMN LePhiThi TYPE DECIMAL(10, 2),
--ALTER COLUMN LePhiThi DROP NOT NULL;
--
---- Alter PhiGiaHan in PhieuGiaHan to DECIMAL(10, 2) NULL
--ALTER TABLE PhieuGiaHan
--ALTER COLUMN PhiGiaHan TYPE DECIMAL(10, 2),
--ALTER COLUMN PhiGiaHan DROP NOT NULL;
--
---- Alter GiamGia in PhieuDangKyDonVi to DECIMAL(5, 2) NULL
--ALTER TABLE PhieuDangKyDonVi
--ALTER COLUMN GiamGia TYPE DECIMAL(5, 2),
--ALTER COLUMN GiamGia DROP NOT NULL;
--
---- Alter TongTien in HoaDon to DECIMAL(13, 2) NULL
--ALTER TABLE HoaDon
--ALTER COLUMN TongTien TYPE DECIMAL(13, 2),
--ALTER COLUMN TongTien DROP NOT NULL;

select * from khachhang k;
select * from phieudangky p; 
select * from phieuduthi pdt;
select * from chungchidangky c;
select * from lichthi l;


update phieudangky set ngaydangky = '2024-05-05' where idphieudangky = 512;




