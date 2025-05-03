const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./database');

const PhieuGiaHan = sequelize.define('phieugiahan', {
  idphieudangky: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'phieudangky',
      key: 'idphieudangky'
    }
  },
  ngaygiahan: {
    type: DataTypes.DATE,
    allowNull: false
  },
  nhanviengiahan: {
    type: DataTypes.INTEGER,
    references: {
      model: 'nhanvien',
      key: 'idnhanvien'
    }
  },
  lichthimoi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'lichthi',
      key: 'idlichthi'
    }
  },
  phigiahan: {
    type: DataTypes.DECIMAL(10, 2)
  },
  trangthaithanhtoan: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'phieugiahan',
  timestamps: false,
  indexes: [
    {
      unique: true,
      primaryKey: true,
      fields: ['idphieudangky', 'ngaygiahan']
    }
  ]
});

const PhieuDangKyDonVi = sequelize.define('phieudangkydonvi', {
  idphieudangky: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'phieudangky',
      key: 'idphieudangky'
    }
  },
  soluongthisinh: {
    type: DataTypes.INTEGER
  },
  giamgia: {
    type: DataTypes.DECIMAL(5, 2)
  }
}, {
  tableName: 'phieudangkydonvi',
  timestamps: false
});

const KhachHang = sequelize.define('khachhang', {
  idkhachhang: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  loaikhachhang: {
    type: DataTypes.STRING(255)
  },
  tenkhachhang: {
    type: DataTypes.STRING(255)
  },
  email: {
    type: DataTypes.STRING(255)
  },
  sdt: {
    type: DataTypes.STRING(20)
  },
  diachi: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'khachhang',
  timestamps: false
});

const QuyDinhTrungTam = sequelize.define('quydinhtrungtam', {
  idquydinh: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  mota: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'quydinhtrungtam',
  timestamps: false
});

const ChungChiDangKy = sequelize.define('chungchidangky', {
  idphieudangky: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'phieudangky',
      key: 'idphieudangky'
    }
  },
  idchungchi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'chungchi',
      key: 'idchungchi'
    }
  }
}, {
  tableName: 'chungchidangky',
  timestamps: false,
  indexes: [
    {
      unique: true,
      primaryKey: true,
      fields: ['idphieudangky', 'idchungchi']
    }
  ]
});

const PhieuDangKy = sequelize.define('phieudangky', {
  idphieudangky: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  idkhachhang: {
    type: DataTypes.INTEGER,
    references: {
      model: 'khachhang',
      key: 'idkhachhang'
    }
  },
  nhanvientiepnhan: {
    type: DataTypes.INTEGER,
    references: {
      model: 'nhanvien',
      key: 'idnhanvien'
    }
  },
  ngaydangky: {
    type: DataTypes.DATE
  },
  trangthai: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'phieudangky',
  timestamps: false
});

const PhieuDuThi = sequelize.define('phieuduthi', {
  sobaodanh: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  idphieudangky: {
    type: DataTypes.INTEGER,
    references: {
      model: 'phieudangky',
      key: 'idphieudangky'
    }
  },
  idlichthi: {
    type: DataTypes.INTEGER,
    references: {
      model: 'lichthi',
      key: 'idlichthi'
    }
  },
  iddonvi: {
    type: DataTypes.INTEGER,
    references: {
      model: 'donvichamthi',
      key: 'iddonvi'
    }
  },
  nhanvienghinhandiem: {
    type: DataTypes.INTEGER,
    references: {
      model: 'nhanvien',
      key: 'idnhanvien'
    }
  },
  ketquathi: {
    type: DataTypes.STRING(255)
  },
  diemsothi: {
    type: DataTypes.FLOAT
  },
  thoigiannhanchungchi: {
    type: DataTypes.DATE
  },
  xacnhannhanchungchi: {
    type: DataTypes.BOOLEAN
  }
}, {
  tableName: 'phieuduthi',
  timestamps: false
});

const ChungChi = sequelize.define('chungchi', {
  idchungchi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  tenchungchi: {
    type: DataTypes.STRING(255)
  },
  lephithi: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  tableName: 'chungchi',
  timestamps: false
});

const HoaDon = sequelize.define('hoadon', {
  idhoadon: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  idphieudangky: {
    type: DataTypes.INTEGER,
    references: {
      model: 'phieudangky',
      key: 'idphieudangky'
    }
  },
  ngaythanhtoan: {
    type: DataTypes.DATE
  },
  tongtien: {
    type: DataTypes.DECIMAL(10, 2)
  },
  nhanvienlaphoadon: {
    type: DataTypes.INTEGER,
    references: {
      model: 'nhanvien',
      key: 'idnhanvien'
    }
  },
  trangthai: {
    type: DataTypes.STRING(255)
  },
  loaithanhtoan: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'hoadon',
  timestamps: false
});

const NhanVien = sequelize.define('nhanvien', {
  idnhanvien: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  tennhanvien: {
    type: DataTypes.STRING(255)
  },
  loainhanvien: {
    type: DataTypes.STRING(255)
  },
  trangthai: {
    type: DataTypes.STRING(255)
  },
  password: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'nhanvien',
  timestamps: false
});

const LichThi = sequelize.define('lichthi', {
  idlichthi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  ngaythi: {
    type: DataTypes.DATE
  },
  giothi: {
    type: DataTypes.TIME
  },
  diadiem: {
    type: DataTypes.STRING(255)
  },
  idphong: {
    type: DataTypes.INTEGER,
    references: {
      model: 'phongthi',
      key: 'idphong'
    }
  },
  nhanviencoithi: {
    type: DataTypes.INTEGER,
    references: {
      model: 'nhanvien',
      key: 'idnhanvien'
    }
  },
  chungchithi: {
     type: DataTypes.INTEGER,
     references: {
       model: 'chungchi',
       key: 'idchungchi'
     }
  }
}, {
  tableName: 'lichthi',
  timestamps: false
});

const PhongThi = sequelize.define('phongthi', {
  idphong: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  succhua: {
    type: DataTypes.INTEGER
  },
  sochotrong: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'phongthi',
  timestamps: false
});

const DonViChamThi = sequelize.define('donvichamthi', {
  iddonvi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  tendonvi: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'donvichamthi',
  timestamps: false
});

// Associations

PhieuDangKy.hasOne(PhieuDangKyDonVi, {
  foreignKey: 'idphieudangky',
  as: 'donvi'
});

PhieuDangKy.hasMany(ChungChiDangKy, {
  foreignKey: 'idphieudangky',
  as: 'chungchidangkys'
});

ChungChiDangKy.belongsTo(PhieuDangKy, {
  foreignKey: 'idphieudangky'
});

ChungChiDangKy.belongsTo(ChungChi, {
  foreignKey: 'idchungchi',
  as: 'chungchi'
});
ChungChi.hasMany(ChungChiDangKy, {
  foreignKey: 'idchungchi',
  as: 'dangkychungchi'
});


// PhieuDangKy -> PhieuGiaHan (One PhieuDangKy can have many PhieuGiaHan)
PhieuDangKy.hasMany(PhieuGiaHan, {
  foreignKey: 'idphieudangky',
  as: 'phieugiahans' // Use a clear alias
});
PhieuGiaHan.belongsTo(PhieuDangKy, {
  foreignKey: 'idphieudangky'
});


// ChungChi -> LichThi
ChungChi.hasMany(LichThi, { foreignKey: 'chungchithi' });
LichThi.belongsTo(ChungChi, { foreignKey: 'chungchithi' });

PhieuDuThi.belongsTo(LichThi, {
  foreignKey: 'idlichthi', // The foreign key in the PhieuDuThi model
  as: 'lichthi'            // The alias you used in your include statement
});

PhieuDuThi.belongsTo(PhieuDangKy, {
  foreignKey: 'idphieudangky', // The foreign key in the PhieuDuThi model
  as: 'phieudangky'            // The alias used in your include statement in the router
});

PhieuDangKy.belongsTo(KhachHang, {
  foreignKey: 'idkhachhang', // The foreign key in the PhieuDangKy model
  // No 'as' needed here unless you specify it in the include from PhieuDangKy
});

LichThi.belongsTo(PhongThi, { foreignKey: 'idphong', as: 'phongthi' });

// --- Missing Associations ---
// Add these to your existing associations block

// Relationships involving PhieuDangKy (Registration Slip)
// PhieuDangKy -> KhachHang: Already have PhieuDangKy.belongsTo(KhachHang), adding the reverse
// Một Khách Hàng có nhiều Phiếu Đăng Ký
KhachHang.hasMany(PhieuDangKy, {
  foreignKey: 'idkhachhang'
});

// PhieuDangKy -> NhanVien (Người tiếp nhận): Thêm cả hai chiều
// Một phiếu đăng ký được tiếp nhận bởi một Nhân Viên
PhieuDangKy.belongsTo(NhanVien, {
  foreignKey: 'nhanvientiepnhan',
  as: 'NhanVienTiepNhan' // Alias for the employee who received the slip
});
// Một Nhân Viên tiếp nhận nhiều Phiếu Đăng Ký
NhanVien.hasMany(PhieuDangKy, {
  foreignKey: 'nhanvientiepnhan',
  as: 'phieudangkyduoctiepnhan' // Alias for the slips received by this employee
});

// PhieuDangKy -> PhieuDangKyDonVi: Already have PhieuDangKy.hasOne(PhieuDangKyDonVi, { as: 'donvi' }), adding the reverse
// Một Phiếu Đăng Ký Đơn Vị thuộc về một Phiếu Đăng Ký
PhieuDangKyDonVi.belongsTo(PhieuDangKy, {
  foreignKey: 'idphieudangky'
});

// PhieuDangKy -> PhieuDuThi: Already have PhieuDuThi.belongsTo(PhieuDangKy, { as: 'phieudangky' }), adding the reverse
// Một phiếu đăng ký có nhiều Phiếu Dự Thi
PhieuDangKy.hasMany(PhieuDuThi, {
  foreignKey: 'idphieudangky'
});

// PhieuDangKy -> HoaDon: Thêm cả hai chiều
// Một phiếu đăng ký có nhiều Hóa Đơn
PhieuDangKy.hasMany(HoaDon, {
  foreignKey: 'idphieudangky'
});
// Một Hóa Đơn thuộc về một Phiếu Đăng Ký (gốc)
// You already have HoaDon.belongsTo(PhieuDangKy, { foreignKey: 'idphieudangky', as: 'phieudangky' }) in your router code, let's define it here officially.
HoaDon.belongsTo(PhieuDangKy, {
  foreignKey: 'idphieudangky',
  as: 'phieudangky' // Alias used in your router code
});


// Relationships involving PhieuGiaHan (Renewal Slip)
// PhieuGiaHan -> PhieuDangKy: You already have both directions defined. OK.

// PhieuGiaHan -> LichThi (Lịch thi mới): Thêm cả hai chiều
// Một Phiếu Gia Hạn tham chiếu đến một Lịch Thi mới sau gia hạn
PhieuGiaHan.belongsTo(LichThi, {
  foreignKey: 'lichthimoi',
  as: 'LichThiMoi' // Alias
});
// Một Lịch Thi có thể được tham chiếu bởi nhiều Phiếu Gia Hạn (là lịch thi mới)
LichThi.hasMany(PhieuGiaHan, {
  foreignKey: 'lichthimoi',
  as: 'phieugiahansmoi' // Alias
});

// PhieuGiaHan -> NhanVien (Người gia hạn): Thêm cả hai chiều
// Một Phiếu Gia Hạn được gia hạn bởi một Nhân Viên
PhieuGiaHan.belongsTo(NhanVien, {
  foreignKey: 'nhanviengiahan',
  as: 'NhanVienGiaHan' // Alias
});
// Một Nhân Viên gia hạn nhiều Phiếu Gia Hạn
NhanVien.hasMany(PhieuGiaHan, {
  foreignKey: 'nhanviengiahan',
  as: 'phieugiahandoi' // Alias
});


// Relationships involving ChungChiDangKy (Linking table)
// PhieuDangKy <-> ChungChiDangKy: You already have both directions defined. OK.
// ChungChiDangKy <-> ChungChi: You already have both directions defined. OK.


// Relationships involving ChungChi (Certificate)
// ChungChi <-> LichThi: You already have both directions defined. OK.

// ChungChi -> ChungChiDangKy: You already have ChungChi.hasMany(ChungChiDangKy), ChungChiDangKy.belongsTo(ChungChi). OK.


// Relationships involving LichThi (Exam Schedule)
// LichThi <-> ChungChi: You already have both directions defined. OK.
// LichThi <-> PhongThi: You already have LichThi.belongsTo(PhongThi, { as: 'phongthi' }), adding the reverse
// Một Phòng Thi có nhiều Lịch Thi
PhongThi.hasMany(LichThi, {
  foreignKey: 'idphong'
});

// LichThi -> PhieuDuThi: Already have PhieuDuThi.belongsTo(LichThi, { as: 'lichthi' }), adding the reverse
// Một Lịch Thi có nhiều Phiếu Dự Thi
LichThi.hasMany(PhieuDuThi, {
  foreignKey: 'idlichthi'
});

// LichThi -> NhanVien (Coi thi): Thêm cả hai chiều
// Một Lịch Thi có một Nhân Viên coi thi
LichThi.belongsTo(NhanVien, {
  foreignKey: 'nhanviencoithi',
  as: 'NhanVienCoiThi' // Alias
});
// Một Nhân Viên coi nhiều Lịch Thi
NhanVien.hasMany(LichThi, {
  foreignKey: 'nhanviencoithi',
  as: 'lichthiduoccoithi' // Alias
});


// Relationships involving PhieuDuThi (Exam Slip)
// PhieuDuThi <-> PhieuDangKy: You already have both directions defined. OK (using alias 'phieudangky' on belongsTo).
// PhieuDuThi <-> LichThi: You already have both directions defined. OK (using alias 'lichthi' on belongsTo).

// PhieuDuThi -> DonViChamThi: Thêm cả hai chiều
// Một Phiếu Dự Thi được chấm bởi một Đơn Vị Chấm Thi
PhieuDuThi.belongsTo(DonViChamThi, {
  foreignKey: 'iddonvi',
  as: 'DonViChamThi' // Alias
});
// Một Đơn Vị Chấm Thi chấm nhiều Phiếu Dự Thi
DonViChamThi.hasMany(PhieuDuThi, {
  foreignKey: 'iddonvi'
});

// PhieuDuThi -> NhanVien (Ghi nhận điểm): Thêm cả hai chiều
// Điểm của Phiếu Dự Thi được ghi nhận bởi một Nhân Viên
PhieuDuThi.belongsTo(NhanVien, {
  foreignKey: 'nhanvienghinhandiem',
  as: 'NhanVienGhiDiem' // Alias
});
// Một Nhân Viên ghi nhận điểm cho nhiều Phiếu Dự Thi
NhanVien.hasMany(PhieuDuThi, {
  foreignKey: 'nhanvienghinhandiem',
  as: 'phieuduthiduocghidiem' // Alias
});


// Relationships involving HoaDon (Invoice)
// HoaDon <-> PhieuDangKy: Already have HoaDon.belongsTo(PhieuDangKy), adding the reverse. OK.

// HoaDon -> NhanVien (Lập hóa đơn): Thêm cả hai chiều
// Một Hóa Đơn được lập bởi một Nhân Viên
HoaDon.belongsTo(NhanVien, {
  foreignKey: 'nhanvienlaphoadon',
  as: 'NhanVienLapHoaDon' // Alias
});
// Một Nhân Viên lập nhiều Hóa Đơn
NhanVien.hasMany(HoaDon, {
  foreignKey: 'nhanvienlaphoadon',
  as: 'hoadondulap' // Alias
});


ChungChi.hasMany(LichThi, { foreignKey: 'chungchithi' });
LichThi.belongsTo(ChungChi, { foreignKey: 'chungchithi' });

module.exports = {
  PhieuGiaHan,
  PhieuDangKyDonVi,
  KhachHang,
  QuyDinhTrungTam,
  ChungChiDangKy,
  PhieuDangKy,
  PhieuDuThi,
  ChungChi,
  HoaDon,
  NhanVien,
  LichThi,
  PhongThi,
  DonViChamThi
};
