const express = require('express');
const router = express.Router();
const sequelize = require('../database');

const { KhachHang, PhieuDuThi, PhieuDangKy, PhieuDangKyDonVi, NhanVien, HoaDon, ChungChiDangKy, ChungChi, LichThi } = require('../models'); // Import your Sequelize models

router.get('/', (req, res) => {
    res.json({ message: 'Register API is working!' });
});

router.get('/get-certificates', async (req, res) => {
    try {
        const certificates = await ChungChi.findAll({
            attributes: ['idchungchi', 'tenchungchi'],
        });
        
        console.log(certificates); // Log the fetched certificates for debugging
        res.json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
});

router.get('/get-schedules', async (req, res) => {
    try {
        const [schedules] = await sequelize.query(`
            SELECT lt.*, pt.SoChoTrong, cc.tenchungchi
            FROM LichThi lt
            LEFT JOIN PhongThi pt ON lt.IDPhong = pt.IDPhong
            LEFT JOIN ChungChi cc on lt.chungchithi = cc.idchungchi
            WHERE COALESCE(lt.SoLuongThiSinhHienTai, 0) < COALESCE(pt.SoChoTrong, 0)
        `);

        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});



router.post('/add-register', async (req, res) => {
    const {
        registerType,
        registrantName,
        registrantContact,
        certificateOption,
        selectedSchedules,
        examinees,
    } = req.body;
  
    try {
      let khachhang = await KhachHang.findOne({
        where: {
          tenkhachhang: registrantName,
          sdt: registrantContact,
        },
      });
  
      if (!khachhang) {
        khachhang = await KhachHang.create({
          tenkhachhang: registrantName,
          sdt: registrantContact,
          email: '',
          diachi: '',
          loaikhachhang: registerType,
        });
      }
  
      const phieudangky = await PhieuDangKy.create({
        idkhachhang: khachhang.idkhachhang,
        nhanvientiepnhan: null,
        ngaydangky: new Date(),
        trangthai: 'Chờ thanh toán',
      });
  
      for (const examinee of examinees) {
        await PhieuDuThi.create({
          idphieudangky: phieudangky.idphieudangky,
          idlichthi: selectedSchedules[0].idlichthi,
          iddonvi: null,
          nhanvienghinhandiem: null,
          ketquathi: null,
          diemsothi: null,
          thoigiannhanchungchi: null,
          xacnhannhanchungchi: false,
          tenthisinh: examinee.examineename,
          ngaysinhts: examinee.examineedob,
        });
      }
  
      await ChungChiDangKy.create({
        idphieudangky: phieudangky.idphieudangky,
        idchungchi: certificateOption,
      });
  
      if (registerType === 'unit') {
        await PhieuDangKyDonVi.create({
          idphieudangky: phieudangky.idphieudangky,
          soluongthisinh: examinees.length,
          giamgia: 0,
        });
      }
  
      const lichthi = await LichThi.findByPk(selectedSchedules[0].idlichthi);

      if (lichthi) {
        const currentValue = lichthi.soluongthisinhhientai;
        const numToAdd = examinees.length;
        const calculatedValue = (currentValue || 0) + numToAdd;
        console.log(`Calculated new value for update: ${calculatedValue}`);

        try {
            const [numberOfAffectedRows] = await LichThi.update(
            { soluongthisinhhientai: calculatedValue }, 
            { where: { idlichthi: lichthi.idlichthi } } 
            );
            console.log(`LichThi update affected ${numberOfAffectedRows} row(s).`);
            if (numberOfAffectedRows === 0) {
            console.warn('LichThi update affected 0 rows. Was the ID correct?');
            }
        } catch(updateError) {
            console.error('Error during LichThi.update():', updateError);
            throw updateError;
        }
      } else {
        console.error('LichThi not found for ID:', selectedSchedules[0].idlichthi);
      }
  
      res.status(201).json({
        message: 'Registration successful',
        idphieudangky: phieudangky.idphieudangky,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to process registration' });
    }
  });
  

module.exports = router;