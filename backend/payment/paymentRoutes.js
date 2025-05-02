const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit'); // dùng để tạo PDF
const { LichThi, PhieuDuThi, PhieuDangKy, PhieuDangKyDonVi, NhanVien, HoaDon, ChungChiDangKy, ChungChi } = require('../models'); // Import your Sequelize models

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
    const lephithiList = phieu.chungchidangkys.map(ccdk => {
      console.log('phieu', phieu)
      console.log('ccdk', ccdk);
      const fee = parseFloat(ccdk.chungchi.lephithi);
      const quantity = isUnit ? (phieu.donvi.soluongthisinh || 0) : 1;
      return fee * quantity;
    });
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
    const phieu = await PhieuDangKy.findByPk(id, {
      include: [
        {
          model: ChungChiDangKy,
          as: 'chungchidangkys',
          include: [
            {
              model: ChungChi,
              as: 'chungchi',
              include: [
                {
                  model: LichThi,
                  as: 'lichthis'
                }
              ]
            }
          ]
        },
        { model: PhieuDangKyDonVi, as: 'donvi', required: false },

      ]
    });
    console.log('DONVI' ,phieu.donvi)
    console.log('DONVI' ,phieu.phieudangkydonvi)

    if (!phieu) return res.status(404).json({ error: 'Không tìm thấy phiếu' });

    if (phieu.trangthai === 'đã thanh toán') {
      return res.status(400).json({ error: 'Phiếu đã được thanh toán' });
    }

    const hoadon = await HoaDon.findOne({ where: { idphieudangky: id } });
    if (hoadon) {
      hoadon.trangthai = 'đã thanh toán';
      await hoadon.save();
    }

    phieu.trangthai = 'đã thanh toán';
    await phieu.save();

    // Tạo danh sách phiếu dự thi từ các chứng chỉ đăng ký
    const createdPhieuDuThis = [];

    for (const ccdk of phieu.chungchidangkys) {
      const chungchi = ccdk.chungchi;
      console.log('CHUNG CHI', chungchi);
    
      if (!chungchi || !chungchi.lichthis || chungchi.lichthis.length === 0) continue;
    
      // Giả sử bạn chọn lịch thi đầu tiên hoặc gần nhất
      const selectedLichThi = chungchi.lichthis[0]; // có thể sắp xếp nếu cần chọn gần nhất
    
      // Nếu là đơn vị thì tạo theo số lượng thí sinh
      const quantity = (phieu.donvi) ? (phieu.donvi.soluongthisinh || 0) : 1;
    
      for (let i = 0; i < quantity; i++) {
        const newPhieuDuThi = await PhieuDuThi.create({
          sobaodanh: Math.floor(100000 + Math.random() * 900000),
          idphieudangky: phieu.idphieudangky,
          idlichthi: selectedLichThi.idlichthi,
          iddonvi: phieu.iddonvi || null,
          nhanvienghinhandiem: null,
          ketquathi: null,
          diemsothi: null,
          thoigiannhanchungchi: null,
          xacnhannhanchungchi: false
        });
    
        createdPhieuDuThis.push(newPhieuDuThi);
      }
    }

    return res.json({
      message: 'Thanh toán thành công và đã tạo các phiếu dự thi',
      trangthai: phieu.trangthai,
      phieuduthis: createdPhieuDuThis
    });
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
        mahoadon: newInvoice.idhoadon,
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

router.post('/download-invoice/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { paymentMethod, totalAmount } = req.body;

  try {
    const hoadon = await HoaDon.findOne({
      where: { idhoadon: id },
    });

    console.log('hoadon', hoadon);

    // Tạo mã hóa đơn và đường dẫn lưu file
    const invoiceCode = id;
    const invoiceFilename = `${invoiceCode}.pdf`;
    const invoicePath = path.join(__dirname, '..', 'invoices', invoiceFilename);
    const invoiceLink = `/invoices/${invoiceFilename}`;

    // Tạo thư mục nếu chưa có
    const invoiceDir = path.dirname(invoicePath);
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    // Tạo file PDF đơn giản
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(invoicePath));

    doc.fontSize(16).text('HOA DON THANH TOAN', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Ma hoa don: ${invoiceCode}`);
    // doc.text(`Mã phiếu đăng ký: ${phieu.idphieudangky}`);
    doc.text(`Hinh thuc thanh toan: ${paymentMethod}`);
    doc.text(`Tong tien: ${parseFloat(totalAmount).toLocaleString()} VNĐ`);

    doc.end();

    return res.json({
      invoice: {
        mahoadon: invoiceCode,
        link: invoiceLink,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể lập hóa đơn' });
  }
});

module.exports = router;
