const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const PDFDocument = require('pdfkit'); // Import PDFKit for PDF generation
const fs = require('fs'); // Import fs for file system operations
const path = require('path'); // Import path for file path operations

const { KhachHang, PhieuDuThi, PhieuDangKy, PhieuDangKyDonVi, NhanVien, HoaDon, ChungChiDangKy, ChungChi, LichThi } = require('../models'); 

router.get('/', (req, res) => {
    res.json({ message: 'Register API is working!' });
});

router.get('/get-registers-customer-filtered', async (req, res) => {
    const { name, sdt } = req.query;

    try {
        const results = await sequelize.query(`
            SELECT kh.*, pd.*
            FROM KhachHang kh LEFT JOIN PhieuDangKy pd ON kh.idkhachhang = pd.idkhachhang 
            WHERE kh.tenkhachhang = :name AND kh.sdt = :sdt
        `, {
            replacements: { name, sdt },
            type: sequelize.QueryTypes.SELECT
        });

        res.json(results);
    } catch (error) {
        console.error('Error executing raw SQL:', error);
        res.status(500).json({ error: 'Failed to fetch filtered registers' });
    }
});

router.get('/get-exam-forms-customer-filtered', async (req, res) => {
    const {id} = req.query;
    try {
        const results = await sequelize.query(`
            SELECT pdt.*, pdk.trangthai, kh.tenkhachhang, lt.ngaythi, lt.giothi, lt.diadiem, cc.tenchungchi, lt.idphong
            FROM PhieuDuThi pdt 
                 LEFT JOIN PhieuDangKy pdk ON pdt.idphieudangky = pdk.idphieudangky
                 LEFT JOIN KhachHang kh ON pdk.idkhachhang = kh.idkhachhang
                 LEFT JOIN LichThi lt ON pdt.idlichthi = lt.idlichthi
                 LEFT JOIN ChungChi cc ON lt.chungchithi = cc.idchungchi
            WHERE pdt.idphieudangky = :id AND pdk.trangthai = 'Da thanh toan'
        `, {
            type: sequelize.QueryTypes.SELECT,
            replacements: { id }
        });

        res.json(results);
    } catch (error) {
        console.error('Error executing raw SQL:', error);
        res.status(500).json({ error: 'Failed to fetch registers' });
    }
});

router.post('/download-exam-form', async (req, res) => {
    const {
        sobaodanh,
        tenthisinh,
        tenkhachhang,
        ngaysinhts,
        tenchungchi,
        ngaythi,
        diadiem,
        giothi,
        idphong
      } = req.body;
    
      const doc = new PDFDocument();
      let buffers = [];
    
      // Collect PDF chunks into a buffer
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
    
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="phieu_duthi_${sobaodanh || 'unknown'}.pdf"`,
          'Content-Length': pdfData.length
        });
        res.end(pdfData);
      });
    
      // PDF content
      doc.fontSize(20).text('Exam Registration Form', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Exam ID: ${sobaodanh}`);
      doc.text(`Candidate Name: ${tenthisinh}`);
      doc.text(`Customer Name: ${tenkhachhang}`);
      doc.text(`Date of Birth: ${ngaysinhts}`);
      doc.text(`Certificate: ${tenchungchi}`);
      doc.text(`Exam Date: ${ngaythi}`);
      doc.text(`Exam Time: ${giothi}`);
      doc.text(`Exam Location: ${diadiem}`);
      doc.text(`Exam Room: ${idphong}`);
    
      doc.end();
});

module.exports = router;
