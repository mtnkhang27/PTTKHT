const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
// Import ALL your models
const {
  LichThi, PhieuDuThi, PhieuDangKy, PhieuDangKyDonVi,
  NhanVien, HoaDon, ChungChiDangKy, ChungChi, PhieuGiaHan,
  KhachHang, QuyDinhTrungTam, PhongThi, DonViChamThi,
} = require('../models');

// Assuming associations like PhieuDangKy.hasMany(PhieuGiaHan, ...) and
// HoaDon.belongsTo(PhieuDangKy, ...) are defined in your models file.
// Make sure HoaDon has a belongsTo PhieuDangKy association defined, e.g.:
// HoaDon.belongsTo(PhieuDangKy, { foreignKey: 'idphieudangky', as: 'phieudangky' });


// Example simple endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Payment API is working!' });
});

// API kiểm tra phiếu đăng ký có thuộc đơn vị không và tính toán chi phí
router.get('/check/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // Tìm phiếu đăng ký và bao gồm cả phiếu gia hạn
    const phieu = await PhieuDangKy.findOne({
      where: { idphieudangky: id },
      include: [
        { model: PhieuDangKyDonVi, as: 'donvi', required: false },
        {
          model: ChungChiDangKy,
          as: 'chungchidangkys',
          include: [{ model: ChungChi, as: 'chungchi' }]
        },
        { // Bao gồm tất cả phiếu gia hạn
          model: PhieuGiaHan,
          as: 'phieugiahans',
          required: false // Vẫn lấy phiếu đăng ký dù không có phiếu gia hạn
          // Không cần order ở đây vì sẽ tính tổng các phiếu Chua thanh toan
        }
      ]
    });

    //Không thấy phiếu, return
    if (!phieu) {
      return res.status(404).json({ error: 'Không tìm thấy phiếu đăng ký' });
    }

    // Lọc ra các phiếu gia hạn có trạng thái 'Chua thanh toan'
    const pendingPhieuGiaHans = phieu.phieugiahans
      ? phieu.phieugiahans.filter(pg => pg.trangthaithanhtoan === 'Chua thanh toan')
      : [];

    let status;
    let lephithiList = []; // Vẫn trả về list này để frontend hiển thị chi tiết các CC
    let totalFee = 0;
    let discount = 0;
    let finalFee = 0;
    const isUnit = !!phieu.donvi; // Vẫn xác định là phiếu đơn vị hay không

    // --- Logic kiểm tra dựa trên Phiếu Gia Hạn Chua thanh toan hoặc Phiếu Đăng Ký gốc ---
    if (pendingPhieuGiaHans.length > 0) {
      // Nếu tồn tại phiếu gia hạn Chua thanh toan, tính tổng phí từ các phiếu này
      console.log(`Tìm thấy ${pendingPhieuGiaHans.length} phiếu gia hạn Chua thanh toan cho ID Phiếu ĐK: ${id}`);

      status = 'Chua thanh toan gia han'; // Trạng thái rõ ràng hơn

      // Tính tổng phí từ các phiếu gia hạn Chua thanh toan
      totalFee = pendingPhieuGiaHans.reduce((sum, pg) => sum + parseFloat(pg.phigiahan || 0.0), 0);
      discount = 0; // Không có giảm giá cho phí gia hạn theo model
      finalFee = totalFee; // Tổng phí sau giảm giá bằng tổng phí

      // Optional: Vẫn tính lephithiList từ PhieuDangKy gốc để hiển thị chi tiết
      lephithiList = phieu.chungchidangkys.map(ccdk => {
          const fee = parseFloat(ccdk.chungchi.lephithi || 0);
          const quantity = isUnit ? (phieu.donvi.soluongthisinh || 0) : 1;
          return {
              tenchungchi: ccdk.chungchi.tenchungchi,
              feePerCandidate: parseFloat(ccdk.chungchi.lephithi || 0),
              quantity: quantity,
              subtotal: fee * quantity
          };
      });

      // Không kiểm tra quá hạn dựa trên ngày đăng ký gốc khi đang xử lý phiếu gia hạn

    } else {
      // Không có phiếu gia hạn Chua thanh toan, xử lý như logic gốc trên phiếu đăng ký
      console.log(`Không tìm thấy phiếu gia hạn Chua thanh toan cho ID: ${id}. Kiểm tra trên phiếu đăng ký gốc.`);

      status = phieu.trangthai;

      // Nếu phiếu gốc Da thanh toan HOẶC tất cả phiếu gia hạn (nếu có) Da thanh toan
      if (status === 'Da thanh toan') {
           return res.json({
               id: phieu.idphieudangky,
               status: status, // Trạng thái của phiếu gốc
               isRenewal: false, // Đây là kiểm tra trên phiếu gốc
               lephithiList: [], // Có thể không cần thiết nếu Da thanh toan gốc? Tùy UI
               totalFee: 0, // Da thanh toan
               discount: 0,
               finalFee: 0,
               isUnit: isUnit,
               message: 'Phiếu đăng ký (hoặc tất cả các phiếu gia hạn liên quan) đã được thanh toán'
           });
       }

      // Kiểm tra quá hạn dựa trên ngày đăng ký gốc CHỈ KHI phiếu gốc Chua thanh toan
      const now = new Date();
      const registerDate = new Date(phieu.ngaydangky);
      const diffDays = (now - registerDate) / (1000 * 60 * 60 * 24);
      const overdue = diffDays > 3; // Quy định 3 ngày quá hạn

      if (overdue) { // Phiếu gốc Chua thanh toan VÀ quá hạn
        return res.status(400).json({ error: 'Phiếu đăng ký gốc đã quá hạn thanh toán' });
      }

      // Tính tổng lệ phí thi từ các chứng chỉ đăng ký (áp dụng khi phiếu gốc Chua thanh toan và chưa quá hạn)
      lephithiList = phieu.chungchidangkys.map(ccdk => {
        const fee = parseFloat(ccdk.chungchi.lephithi || 0);
        const quantity = isUnit ? (phieu.donvi.soluongthisinh || 0) : 1;
        return {
             tenchungchi: ccdk.chungchi.tenchungchi,
             feePerCandidate: parseFloat(ccdk.chungchi.lephithi || 0),
             quantity: quantity,
             subtotal: fee * quantity
         };
      });
      totalFee = lephithiList.reduce((sum, item) => sum + item.subtotal, 0);

      const unitDiscountRate = isUnit ? parseFloat(phieu.donvi.giamgia || 0.0) : 0.0;
      discount = totalFee * unitDiscountRate;

      finalFee = totalFee - discount;
    }
    // --- Kết thúc logic kiểm tra ---


    // Trả về kết quả cho trường hợp cần thanh toán (trạng thái Chua thanh toan, chưa quá hạn)
    return res.json({
      id: phieu.idphieudangky,
      status: status, // Trạng thái hiện tại
      isRenewal: pendingPhieuGiaHans.length > 0, // Cờ báo có phải đang xem phí gia hạn không
      lephithiList, // Chi tiết các chứng chỉ (từ phiếu gốc)
      totalFee,     // Tổng phí cần thanh toán (tổng phí GH chưa TT nếu có, nếu không là tổng phí CC gốc)
      discount,   // Giảm giá (chỉ áp dụng cho phiếu gốc đơn vị)
      finalFee,     // Số tiền cuối cùng cần thanh toán
      isUnit: isUnit // Có phải đơn vị hay không
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi kiểm tra thanh toán', details: err.message });
  }
});

// API xác nhận thanh toán
router.post('/confirm/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  // Assuming req.body might contain information about which payment method was used,
  // or confirmation details from a payment gateway, though not used in the current logic.
  // const { paymentDetails } = req.body;

  try {
    // Use a transaction for atomicity if updating multiple records
    const result = await sequelize.transaction(async (t) => {
        // 1. Tìm phiếu đăng ký kèm các phiếu gia hạn Chua thanh toan
        const phieu = await PhieuDangKy.findByPk(id, {
            include: [
                 {
                  model: PhieuGiaHan,
                  as: 'phieugiahans',
                  where: { trangthaithanhtoan: 'Chua thanh toan' }, // Chỉ lấy các phiếu gia hạn Chua thanh toan
                  required: false // Vẫn lấy phiếu đăng ký nếu không có phiếu gia hạn Chua thanh toan
                },
                {
                  model: ChungChiDangKy,
                  as: 'chungchidangkys',
                  include: [
                    {
                      model: ChungChi,
                      as: 'chungchi',
                      include: [
                        { model: LichThi, as: 'lichthis' }
                      ]
                    }
                  ]
                },
                { model: PhieuDangKyDonVi, as: 'donvi', required: false },
            ],
             transaction: t // Pass transaction to find operation
        });

        if (!phieu) {
             return { status: 404, error: 'Không tìm thấy phiếu' };
        }

        const pendingPhieuGiaHans = phieu.phieugiahans || [];
        let message = '';
        let createdPhieuDuThis = [];
        let updatedHoaDon = null; // Keep track of the updated/created HoaDon

        if (pendingPhieuGiaHans.length > 0) {
            // --- Xử lý thanh toán cho Phiếu Gia Hạn ---

            // Check if all pending already paid (shouldn't happen with the where clause, but good practice)
            if (pendingPhieuGiaHans.every(pg => pg.trangthaithanhtoan === 'Da thanh toan')) {
                 return { status: 400, error: 'Tất cả các phiếu gia hạn đã được thanh toán' };
            }

            // Cập nhật trạng thái thanh toán cho TẤT CẢ các phiếu gia hạn đang chờ thanh toán
            for (const pg of pendingPhieuGiaHans) {
                pg.trangthaithanhtoan = 'Da thanh toan';
                // Add payment date? The HoaDon will have the payment date.
                await pg.save({ transaction: t });
            }

            message = `Thanh toán thành công ${pendingPhieuGiaHans.length} phiếu gia hạn.`;

            // Find the related HoaDon for this original registration.
            // Note: The current HoaDon model structure makes it hard to link
            // an invoice specifically to a *renewal* payment event.
            // This finds the *latest* related HoaDon based on idphieudangky.
            // A better approach might require changing the HoaDon model or
            // creating a new invoice specifically for the renewal payment.
             updatedHoaDon = await HoaDon.findOne({
                 where: { idphieudangky: id, trangthai: 'Chua thanh toan' },
                 transaction: t
             });

             if (updatedHoaDon && updatedHoaDon.trangthai === 'Chua thanh toan') {
                 // Assume this latest pending invoice is for the renewals just paid.
                 updatedHoaDon.trangthai = 'Da thanh toan';
                 updatedHoaDon.ngaythanhtoan = new Date();
                 await updatedHoaDon.save({ transaction: t });
             }


            // --- Logic to create new PhieuDuThi for renewed items ---
            // This part depends on the business logic for renewals.
            // If a renewal means the candidate will retake an exam for a specific certificate
            // using a new LichThi specified in the PhieuGiaHan, you need to create
            // a new PhieuDuThi here.
            // Iterate through the PAID (now 'Da thanh toan') pendingPhieuGiaHans
            // For each, find the corresponding ChungChiDangKy (if needed) and the LichThi
            // from the renewal slip, then create PhieuDuThi.

            // Example (conceptual):
            // for (const paidPg of pendingPhieuGiaHans.filter(pg => pg.trangthaithanhtoan === 'Da thanh toan')) {
            //     // Assuming PhieuGiaHan has fields like idchungchi and idlichthimoi
            //     // You might need to find the ChungChiDangKy record related to this renewal if needed
            //     // const relatedCcdk = phieu.chungchidangkys.find(...)
            //
            //     if (paidPg.idlichthimoi) { // Check if renewal specifies a new exam date
            //          const newPhieuDuThi = await PhieuDuThi.create({
            //               sobaodanh: Math.floor(100000 + Math.random() * 900000),
            //               idphieudangky: phieu.idphieudangky, // Still linked to original registration
            //               idlichthi: paidPg.idlichthimoi, // Use the new exam date from renewal
            //               // Link to certificate? Need to know which certificate the renewal is for.
            //               // May need a field in PhieuGiaHan for this.
            //               // idchungchi: paidPg.idchungchi, // Assuming PhieuGiaHan links to a certificate
            //               // Other fields...
            //          }, { transaction: t });
            //          createdPhieuDuThis.push(newPhieuDuThi);
            //     }
            // }
            // The current code doesn't have this detail in PhieuGiaHan or the models,
            // so leaving it as a conceptual example.

             // --- Tạm thời KHÔNG tạo Phiếu Dự Thi mới ở đây cho logic gia hạn với cấu trúc hiện tại ---
             // You would add the logic here if your model supports it and it's required after renewal payment.


        } else {
            // --- Xử lý thanh toán cho Phiếu Đăng Ký gốc (nếu không có phiếu gia hạn Chua thanh toan) ---

            // Kiểm tra nếu phiếu gốc Da thanh toan
            if (phieu.trangthai === 'Da thanh toan') {
                return { status: 400, error: 'Phiếu đăng ký gốc đã được thanh toán' };
            }

            // Cập nhật trạng thái thanh toán cho Phiếu Đăng Ký gốc
            phieu.trangthai = 'Da thanh toan';
            await phieu.save({ transaction: t });

            message = 'Thanh toán phiếu đăng ký gốc thành công và đã tạo các phiếu dự thi';

            // Find and update the related HoaDon gốc (if it exists and is pending)
            updatedHoaDon = await HoaDon.findOne({
                where: { idphieudangky: id, trangthai: 'Chua thanh toan' },
                transaction: t
            });

            if (updatedHoaDon) {
              updatedHoaDon.trangthai = 'Da thanh toan';
              updatedHoaDon.ngaythanhtoan = new Date(); // Thêm ngày thanh toán
              await updatedHoaDon.save({ transaction: t });
            }


            // Tạo danh sách phiếu dự thi từ các chứng chỉ đăng ký gốc
            // for (const ccdk of phieu.chungchidangkys) {
            //   const chungchi = ccdk.chungchi;

            //   if (!chungchi || !chungchi.lichthis || chungchi.lichthis.length === 0) {
            //        console.warn(`Chứng chỉ ${ccdk.idchungchi} không có lịch thi.`);
            //        continue; // Bỏ qua chứng chỉ không có lịch thi
            //   }

            //   // Giả sử bạn chọn lịch thi đầu tiên hoặc gần nhất cho lần đăng ký ban đầu
            //   // Cần đảm bảo logic chọn lịch thi phù hợp
            //   const selectedLichThi = chungchi.lichthis[0]; // có thể sắp xếp nếu cần chọn gần nhất

            //   // Nếu là đơn vị thì tạo theo số lượng thí sinh
            //   const quantity = (phieu.donvi) ? (phieu.donvi.soluongthisinh || 0) : 1;

            //   for (let i = 0; i < quantity; i++) {
            //     const newPhieuDuThi = await PhieuDuThi.create({
            //       sobaodanh: Math.floor(100000 + Math.random() * 900000), // Sửa lỗi: random số báo danh
            //       idphieudangky: phieu.idphieudangky,
            //       idlichthi: selectedLichThi.idlichthi,
            //       // iddonvi: phieu.iddonvi || null, // iddonvi trong PhieuDuThi tham chiếu DonViChamThi, không phải PhieuDangKyDonVi. Cần kiểm tra lại schema và logic.
            //       // Tạm thời bỏ qua iddonvi hoặc cần tìm iddonvi chấm thi phù hợp
            //       nhanvienghinhandiem: null,
            //       ketquathi: null,
            //       diemsothi: null,
            //       thoigiannhanchungchi: null,
            //       xacnhannhanchungchi: false
            //     }, { transaction: t }); // Pass transaction to create operation

            //     createdPhieuDuThis.push(newPhieuDuThi);
            //   }
            // }
        } // End of else for original registration payment

         // Commit transaction if everything was successful
         return {
             status: 200,
             message: message,
             trangthai: phieu.trangthai,
             phieuduthis: createdPhieuDuThis, // Will be empty for renewal payments with current logic
             hoadon: updatedHoaDon ? { // Return minimal HoaDon info if updated/found
                 idhoadon: updatedHoaDon.idhoadon,
                 trangthai: updatedHoaDon.trangthai,
                 ngaythanhtoan: updatedHoaDon.ngaythanhtoan
             } : null
         };

    }); // End of transaction

    if (result.status !== 200) {
        return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
        message: result.message,
        trangthai: result.trangthai,
        phieuduthis: result.phieuduthis,
        hoadon: result.hoadon
    });


  } catch (err) {
    console.error('Lỗi khi xác nhận thanh toán:', err);
    res.status(500).json({ error: 'Lỗi khi xác nhận thanh toán', details: err.message });
  }
});


// API tạo hóa đơn
router.post('/create-invoice/:idphieudangky', async (req, res) => {
    const idphieudangky = parseInt(req.params.idphieudangky);
    // paymentMethod can still be taken from body as it's user input for type
    const { paymentMethod } = req.body; // Removed totalAmount from body

    try {
        const phieu = await PhieuDangKy.findByPk(idphieudangky, {
             include: [
                 {
                    model: PhieuGiaHan,
                    as: 'phieugiahans',
                    where: { trangthaithanhtoan: 'Chua thanh toan' }, // Chỉ lấy các phiếu gia hạn Chua thanh toan
                    required: false
                 },
                 // Cần include các thông tin khác để tính toán totalAmount
                 { model: PhieuDangKyDonVi, as: 'donvi', required: false },
                 {
                   model: ChungChiDangKy,
                   as: 'chungchidangkys',
                   include: [{ model: ChungChi, as: 'chungchi' }]
                 }
            ]
        });

        if (!phieu) {
             return res.status(404).json({ error: 'Không tìm thấy phiếu đăng ký' });
        }

        // Check if an outstanding invoice already exists for this registration
        // This prevents creating multiple invoices for the same pending payment
        const existingInvoice = await HoaDon.findOne({
            where: {
                idphieudangky: idphieudangky,
                trangthai: 'Chua thanh toan'
            }
        });

        if (existingInvoice) {
             return res.status(400).json({
                 error: 'Đã tồn tại hóa đơn Chua thanh toan cho phiếu đăng ký này.',
                 invoice: { // Return existing invoice details
                     mahoadon: existingInvoice.idhoadon,
                     tongtien: parseFloat(existingInvoice.tongtien),
                     loaithanhtoan: existingInvoice.loaithanhtoan,
                     trangthai: existingInvoice.trangthai,
                     // link: `/invoices/${existingInvoice.idhoadon}` // Link is handled by download route
                 }
             });
        }


        // Determine the fee to put on the invoice based on pending renewals or original registration
        const pendingPhieuGiaHans = phieu.phieugiahans || [];
        let feeToInvoice;
        let invoiceContext = 'original'; // 'original' or 'renewal' - For internal tracking if needed

        if (pendingPhieuGiaHans.length > 0) {
            // If there are pending renewal slips, the invoice is for the sum of their fees
            feeToInvoice = pendingPhieuGiaHans.reduce((sum, pg) => sum + parseFloat(pg.phigiahan || 0.0), 0);
            invoiceContext = 'renewal';
            console.log(`Creating invoice for pending renewal fees: ${feeToInvoice}`);

        } else {
             // If no pending renewal slips, the invoice is for the original registration fee (if not paid)
            if (phieu.trangthai === 'Da thanh toan') {
              // This case should ideally be caught by the existingInvoice check,
              // but adding a redundant check here.
              return res.status(400).json({ error: 'Phiếu gốc Da thanh toan, không cần tạo hóa đơn mới.' });
            }

            // Calculate original fee
            const isUnit = !!phieu.donvi;
            const lephithiList = phieu.chungchidangkys.map(ccdk => {
               const fee = parseFloat(ccdk.chungchi.lephithi || 0);
               const quantity = isUnit ? (phieu.donvi.soluongthisinh || 0) : 1;
               return fee * quantity;
            });
            const totalOriginalFee = lephithiList.reduce((sum, fee) => sum + fee, 0);
            const unitDiscountRate = isUnit ? parseFloat(phieu.donvi.giamgia || 0.0) : 0.0;
            const discount = totalOriginalFee * unitDiscountRate;
            feeToInvoice = totalOriginalFee - discount;
            invoiceContext = 'original';
            console.log(`Creating invoice for original registration fee: ${feeToInvoice}`);
        }

        // Use feeToInvoice instead of totalAmount from body - SAFER
        const finalAmountToInvoice = feeToInvoice;

        // Create new invoice
        const newInvoice = await HoaDon.create({
          idphieudangky: phieu.idphieudangky, // Invoice still linked to the original registration
          ngaythanhtoan: null, // Payment date is null initially
          tongtien: finalAmountToInvoice, // Use the calculated amount
          loaithanhtoan: paymentMethod, // Get payment method from body
          nhanvienlaphoadon: 105, // Hardcoded employee ID - Consider using authenticated user
          trangthai: 'Chua thanh toan',
          // Optional: Add a field here to store the invoiceContext ('original' or 'renewal')
          // if you need to reconstruct the exact contents later without inference.
          // context: invoiceContext
        });

        // Return invoice information
        return res.json({
          message: 'Hóa đơn đã được tạo',
          invoice: {
            mahoadon: newInvoice.idhoadon,
            idphieudangky: newInvoice.idphieudangky,
            tongtien: parseFloat(newInvoice.tongtien),
            loaithanhtoan: newInvoice.loaithanhtoan,
            trangthai: newInvoice.trangthai,
            // No link in the response, the download endpoint handles fetching by id
            // link: `/invoices/${newInvoice.idhoadon}`,
          }
        });

    } catch (err) {
      console.error('Lỗi khi tạo hóa đơn:', err);
      res.status(500).json({ error: 'Lỗi khi tạo hóa đơn', details: err.message });
    }
});

// API tải hóa đơn (PDF)
router.get('/download-invoice/:idhoadon', async (req, res) => {
  const idhoadon = parseInt(req.params.idhoadon);

  try {
      // Chỉ cần fetch HoaDon và PhieuDangKy liên quan
      const hoadon = await HoaDon.findByPk(idhoadon, {
          include: [
              {
                  model: PhieuDangKy,
                  as: 'phieudangky', // Đảm bảo association này được định nghĩa
                  required: true,
                  include: [
                      {
                          model: PhieuDangKyDonVi,
                          as: 'donvi', // Đảm bảo association này được định nghĩa
                          required: false
                      }
                      // Không cần include ChungChiDangKy, ChungChi, PhieuGiaHan cho hóa đơn đơn giản
                  ]
              }
          ]
      });

      if (!hoadon) {
          return res.status(404).json({ error: 'Không tìm thấy hóa đơn' });
      }

      const phieuDangKy = hoadon.phieudangky;
      // Xác định tên khách hàng
      // const customerName = phieuDangKy.donvi ? phieuDangKy.donvi.tendonvi : (phieuDangKy.hoten || `Cá nhân ${phieuDangKy.idphieudangky}`);
      // const isUnit = !!phieuDangKy.donvi; // Không cần dùng biến này nữa
      const khachHang = await KhachHang.findOne({ where: {idkhachhang: phieuDangKy.idkhachhang }});
      const customerName = khachHang.tenkhachhang;
      console.log(khachHang);
      
      // Lấy thông tin cơ bản từ hóa đơn database
      const invoiceCode = hoadon.idhoadon;
      const totalAmount = parseFloat(hoadon.tongtien || 0); // Lấy từ DB, đảm bảo là số
      const paymentMethod = hoadon.loaithanhtoan || 'Chưa xác định';
      const invoiceDate = new Date(hoadon.ngaythanhtoan).toLocaleDateString('vi-VN'); // Ngày lập hóa đơn
      const paymentStatus = hoadon.trangthai || 'Chưa xác định';


      // PDF Generation setup
      const doc = new PDFDocument();
      const invoiceFilename = `HoaDon_${hoadon.idhoadon}.pdf`;
      const invoicePath = path.join(__dirname, '..', 'invoices', invoiceFilename); // Lưu lại trên server

      // Đảm bảo thư mục tồn tại
      const invoiceDir = path.dirname(invoicePath);
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      // Pipe PDF ra file và response
      const fileStream = fs.createWriteStream(invoicePath);
      doc.pipe(fileStream);

      // Thiết lập header cho response để tải file PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${invoiceFilename}"`);
      doc.pipe(res); // Pipe ra response

      // Thêm nội dung đơn giản vào PDF
      doc.fontSize(18).text('HOA DON THANH TOAN', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12)
         .text(`Ma hoa don: ${invoiceCode}`)
         .text(`Ngay lap: ${invoiceDate}`)
         .text(`Trang thai: ${paymentStatus}`)
         .text(`Hinh thuc thanh toan: ${paymentMethod}`);

      doc.moveDown();
      doc.text(`Ma phieu dang ky lien quan: ${phieuDangKy.idphieudangky}`); // Liên kết với phiếu đăng ký gốc
      doc.text(`Khach hang: ${customerName}`);
       // Có thể thêm địa chỉ hoặc thông tin liên hệ nếu có trong PhieuDangKy/DonVi

      doc.moveDown(2); // Cách một khoảng
      doc.fontSize(14).text('Tong tien thanh toan:', { align: 'left' });
      const currencyText = totalAmount.toLocaleString('vi-VN') + ' VND';
      doc.text(currencyText, { align: 'left' });
      doc.font('Helvetica'); // Trở lại font thường

      // Kết thúc PDF
      doc.end();

      // Response đã được stream, không cần gửi JSON

  } catch (err) {
    console.error('Lỗi khi lập hóa đơn PDF:', err);
    // Kiểm tra xem headers đã được gửi chưa để tránh lỗi
    if (!res.headersSent) {
        res.status(500).json({ error: 'Không thể lập hóa đơn PDF', details: err.message });
    } else {
        console.error('Headers already sent, could not send 500 error response during PDF generation.');
    }
  }
});


module.exports = router;