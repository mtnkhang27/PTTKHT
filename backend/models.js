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
    primaryKey: true,
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

const PhieuDangKyDonVi = sequelize.define('phieudangky_donvi', {
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
  tableName: 'phieudangky_donvi',
  timestamps: false
});

const KhachHang = sequelize.define('khachhang', {
  idkhachhang: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
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
    allowNull: false
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
    allowNull: false
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
    allowNull: false
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
    allowNull: false
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
    allowNull: false
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
  }
}, {
  tableName: 'hoadon',
  timestamps: false
});

const NhanVien = sequelize.define('nhanvien', {
  idnhanvien: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
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
    allowNull: false
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
    allowNull: false
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
    allowNull: false
  },
  tendonvi: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'donvichamthi',
  timestamps: false
});


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