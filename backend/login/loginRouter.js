const express = require('express');
const router = express.Router();
const { NhanVien } = require('../models'); 

router.get('/', (req, res) => {
  res.json({ message: 'Login API is working!' });
});

// POST /api/login
router.post('/check-login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const nhanVien = await NhanVien.findOne({
      where: {
        idnhanvien: username,
        password: password
      }
    });

    if (!nhanVien) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Optionally create a session or JWT here

    res.json({
      message: 'Đăng nhập thành công',
      nhanVien: {
        id: nhanVien.idnhanvien,
        name: nhanVien.tennhanvien,
        type: nhanVien.loainhanvien,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
