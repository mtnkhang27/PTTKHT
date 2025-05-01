const express = require('express');
const router = express.Router();
const sequelize = require('../database');

const { PhieuDuThi, PhieuDangKy, PhieuDangKyDonVi, NhanVien, HoaDon, ChungChiDangKy, ChungChi } = require('../models'); // Import your Sequelize models

// Ví dụ một endpoint đơn giản
router.get('/', (req, res) => {
  res.json({ message: 'Payment API is working!' });
});

// API kiểm tra phiếu đăng ký có thuộc đơn vị không
router.get('/check/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // Tìm phiếu đăng ký
    const phieu = await PhieuDangKy.findOne({
      where: { idphieudangky: id },
      include: [
        { model: PhieuDangKyDonVi, as: 'donvi', required: false },
        {
          model: ChungChiDangKy,
          as: 'chungchidangkys',
          include: [{ model: ChungChi, as: 'chungchi' }]
        }
      ]
    });

    //Không thấy phiếu, return
    if (!phieu) return res.status(404).json({ error: 'Không tìm thấy phiếu đăng ký' });

    //Kiểm tra coi phiếu đó có phải phiếu đăng ký của đơn vị hay không
    const isUnit = !!phieu.donvi;

    //Kiểm tra quá hạn
    const now = new Date();
    const registerDate = new Date(phieu.ngaydangky);
    const diffDays = (now - registerDate) / (1000 * 60 * 60 * 24);
    const overdue = diffDays > 3;

    if (overdue) {
      return res.status(400).json({ error: 'Quá hạn thanh toán' });
    }

    // Tính tổng lệ phí thi
    const lephithiList = phieu.chungchidangkys.map(ccdk => parseFloat(ccdk.chungchi.lephithi));
    const totalFee = lephithiList.reduce((sum, fee) => sum + fee, 0);

    const unitDiscount = isUnit ? parseFloat(phieu.donvi.giamgia) || 0.0 : 0.0;
    const discount = totalFee * unitDiscount;
    
    const finalFee = totalFee - discount;

    return res.json({
      id: phieu.idphieudangky,
      status: phieu.trangthai,
      lephithiList,
      totalFee,
      discount,
      finalFee,
      isUnit
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi kiểm tra thanh toán' });
  }
});


router.post('/confirm/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const phieu = await PhieuDangKy.findByPk(id);
    if (!phieu) return res.status(404).json({ error: 'Không tìm thấy phiếu' });

    if (phieu.trangthai === 'đã thanh toán') {
      return res.status(400).json({ error: 'Phiếu đã được thanh toán' });
    }

    // Cập nhật trạng thái
    phieu.trangthai = 'đã thanh toán';
    await phieu.save();

    return res.json({ message: 'Thanh toán thành công', trangthai: phieu.trangthai });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi xác nhận thanh toán' });
  }
});

// API tạo hóa đơn
router.post('/create-invoice/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { paymentMethod, registrationId, totalAmount } = req.body;
  console.log('method', paymentMethod);
  console.log('registrationId', registrationId);
  try {
    const phieu = await PhieuDangKy.findOne({
      where: { idphieudangky: registrationId },
      include: [
        { model: PhieuDangKyDonVi, as: 'donvi', required: false },
        {
          model: ChungChiDangKy,
          as: 'chungchidangkys',
          include: [{ model: ChungChi, as: 'chungchi' }]
        }
      ]
    });
    // Kiểm tra trạng thái của phiếu đăng ký
    if (phieu.trangthai === 'đã thanh toán') {
      return res.status(400).json({ error: 'Phiếu đã thanh toán' });
    }

    // Tạo hóa đơn mới
    const newInvoice = await HoaDon.create({
      idphieudangky: phieu.idphieudangky,
      ngaythanhtoan: null,
      tongtien: totalAmount,
      loaithanhtoan: paymentMethod, // Phương thức thanh toán
      nhanvienlaphoadon: 105,
      trangthai: 'chưa thanh toán',
    });

    // Trả về thông tin hóa đơn
    return res.json({
      message: 'Hóa đơn đã được tạo',
      invoice: {
        mahoadon: newInvoice.id,
        totalFee: newInvoice.totalFee,
        discount: newInvoice.discount,
        finalFee: newInvoice.finalFee,
        paymentMethod: newInvoice.paymentMethod,
        status: newInvoice.status,
        link: `/invoices/${newInvoice.id}`, // Giả sử có route để hiển thị hóa đơn
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi tạo hóa đơn' });
  }
});

module.exports = router;
