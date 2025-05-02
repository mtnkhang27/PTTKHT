const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const { Op } = require('sequelize'); // Import Op for comparison operators
const {
  PhieuDuThi,
  PhieuDangKy,
  LichThi,
  PhieuGiaHan,
  ChungChi,
  KhachHang,
  NhanVien, // Assuming NhanVien is needed for logging/assigning staff
  QuyDinhTrungTam // Potentially needed for rules, though hardcoded here for simplicity
} = require('../models'); // Adjust the path based on your project structure

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
  

// Helper function to calculate difference in hours
const calculateHoursDiff = (dateTime1, dateTime2) => {
  const date1 = new Date(dateTime1);
  const date2 = new Date(dateTime2);
  const diffMs = date1.getTime() - date2.getTime();
  return diffMs / (1000 * 60 * 60); // Difference in hours
};

// --- Endpoint 1: Check Reschedule Eligibility and Get Available Dates ---
// POST /reschedule/check
// Request body: { sobaodanh: number, isSpecialCase: boolean, reason: string, idnhanvienTiepNhan: number }
router.post('/check', async (req, res) => {
  const { sobaodanh, isSpecialCase, reason, idnhanvienTiepNhan } = req.body;

  // Basic validation
  if (!sobaodanh || typeof isSpecialCase === 'undefined' || !idnhanvienTiepNhan) {
    return res.status(400).json({ error: 'Missing required fields (sobaodanh, isSpecialCase, idnhanvienTiepNhan)' });
  }

  try {
    // Find the original exam ticket with related info
    const phieuDuThi = await PhieuDuThi.findOne({
      where: { sobaodanh },
      include: [
        {
          model: LichThi,
          as: 'lichthi', // Assuming you have this alias defined in your associations
          include: [
            {
              model: ChungChi,
              as: 'chungchi', // Assuming LichThi belongsTo ChungChi with this alias
            }
          ]
        },
        {
          model: PhieuDangKy,
          as: 'phieudangky', // Assuming PhieuDuThi belongsTo PhieuDangKy with this alias
          include: [KhachHang] // Include KhachHang to identify customer
        }
      ]
    });

    if (!phieuDuThi) {
      return res.status(404).json({ error: 'Phiếu dự thi không tồn tại.' });
    }

    if (!phieuDuThi.lichthi) {
        return res.status(400).json({ error: 'Phiếu dự thi chưa có lịch thi được phân công.' });
    }

    // Combine date and time for comparison
    const originalExamDateTime = new Date(phieuDuThi.lichthi.ngaythi);
    const [hours, minutes, seconds] = phieuDuThi.lichthi.giothi.split(':');
    originalExamDateTime.setHours(hours, minutes, seconds, 0);

    const now = new Date();
    const hoursUntilExam = calculateHoursDiff(originalExamDateTime, now);

    // Check 24-hour rule
    if (hoursUntilExam < 24) {
      return res.status(400).json({ error: 'Không thể gia hạn. Yêu cầu gia hạn phải trước giờ thi ít nhất 24 giờ.' });
    }

    // Check reschedule limit (max 2 times per PhieuDangKy)
    const rescheduleCount = await PhieuGiaHan.count({
      where: { idphieudangky: phieuDuThi.idphieudangky }
    });

    if (rescheduleCount >= 2) {
      return res.status(400).json({ error: 'Phiếu đăng ký này đã đạt giới hạn số lần gia hạn (tối đa 2 lần).' });
    }

    // If it's a special case and eligible, find available dates
    let availableDates = [];
    // Find future exam schedules for the same certificate that have space
    availableDates = await LichThi.findAll({
        where: {
        chungchithi: phieuDuThi.lichthi.chungchi.idchungchi, // Same certificate
        // Find schedules strictly in the future by comparing combined date and time as TIMESTAMP against NOW()
        [Op.and]: sequelize.where(
            // Corrected: Use sequelize.literal with just column names for the main model
            sequelize.literal('"ngaythi" + "giothi"'),
            {
            [Op.gt]: sequelize.fn('NOW') // Compare TIMESTAMP > TIMESTAMP WITH TIME ZONE
            }
        )
        },
        attributes: ['idlichthi', 'ngaythi', 'giothi', 'diadiem'],
        order: [['ngaythi', 'ASC'], ['giothi', 'ASC']] // Order by date and time
    });

    if (availableDates.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lịch thi mới phù hợp cho loại chứng chỉ này.' });
    }

    // Return eligibility status and available dates (if applicable)
    res.json({
      success: true,
      message: 'Yêu cầu gia hạn hợp lệ.',
      isSpecialCase: isSpecialCase,
      currentRescheduleCount: rescheduleCount,
      availableDates: availableDates, 
    });

  } catch (error) {
    console.error('Error checking reschedule eligibility:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi kiểm tra gia hạn.', details: error.message });
  }
});

// --- Endpoint 2: Confirm Reschedule and Create PhieuGiaHan ---
// POST /reschedule/confirm
// Request body: { sobaodanh: number, idlichthimoi: number, idnhanvienLapDon: number, phiGiaHan: number (optional, for voluntary) }
router.post('/confirm', async (req, res) => {
    const { sobaodanh, idlichthimoi, idnhanvienLapDon, giahandacbiet } = req.body;

    // Basic validation
    if (!sobaodanh || !idlichthimoi || !idnhanvienLapDon) {
        return res.status(400).json({ error: 'Missing required fields (sobaodanh, idlichthimoi, idnhanvienLapDon).' });
    }

    // Optional: Basic validation for phiGiaHan if not special case
    // This endpoint assumes eligibility check via /check has passed
    // and idlichthimoi is a valid selected date.

    try {
        // Find the original exam ticket and its registration
        const phieuDuThi = await PhieuDuThi.findOne({
            where: { sobaodanh },
            include: [{ model: PhieuDangKy, as: 'phieudangky' }]
        });

        if (!phieuDuThi) {
            return res.status(404).json({ error: 'Phiếu dự thi không tồn tại.' });
        }

        if (!phieuDuThi.phieudangky) {
             return res.status(400).json({ error: 'Không tìm thấy phiếu đăng ký liên quan.' });
        }

        // Find the selected new exam schedule
        const newLichThi = await LichThi.findOne({ where: { idlichthi: idlichthimoi } });

        if (!newLichThi) {
            return res.status(404).json({ error: 'Lịch thi mới được chọn không tồn tại.' });
        }

        // Re-check slot availability for the chosen new schedule (prevent double booking)
        if (newLichThi.sochotrong <= 0) {
             return res.status(400).json({ error: 'Lịch thi mới được chọn đã đầy chỗ.' });
        }


        // Determine fee and payment status
        // This logic should ideally align with the check endpoint's result
        // For this example, we'll rely on phiGiaHan being provided for voluntary cases
        // In a real app, you'd fetch the fee based on the certificate or regulations.
        // let fee = phiGiaHan || 0; // Default to 0, expect fee for voluntary
        let trangThaiThanhToan = 'pending'; // Default status

        // Assume if phiGiaHan is provided (>0), it's a voluntary case and payment is pending
        // If fee is 0, assume it's a special case or payment is handled differently
        // A more robust system might link this to a HoaDon creation step.
        // if (fee > 0) {
        //     trangThaiThanhToan = 'pending'; // Requires payment
        //     // TODO: Logic to create HoaDon should go here or be triggered after this step
        // } else {
        //      trangThaiThanhToan = 'paid'; // Assume paid/waived for special cases
        // }


        // Create the PhieuGiaHan record
        const phieuGiaHan = await PhieuGiaHan.create({
            idphieudangky: phieuDuThi.idphieudangky,
            ngaygiahan: new Date(), // Record the date of the reschedule action
            nhanviengiahan: idnhanvienLapDon,
            lichthimoi: idlichthimoi, // Link to the new exam schedule
            trangthaithanhtoan: trangThaiThanhToan
        });

        // Optional: Update the count of available slots in the new LichThi
        newLichThi.sochotrong -= 1;
        await newLichThi.save();

        // Optional: Update the status of the original PhieuDuThi
        // phieuDuThi.trangthai = 'rescheduled'; // Assuming a 'trangthai' field exists or is needed
        // await phieuDuThi.save();

        // The description mentions adding to a list for new PhieuDuThi issuance.
        // This could be an internal system trigger based on the creation of PhieuGiaHan
        // or completion of payment (if pending).

        res.status(201).json({
            success: true,
            message: 'Gia hạn thành công.',
            phieuGiaHan: phieuGiaHan
        });

    } catch (error) {
        console.error('Error confirming reschedule:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi xác nhận gia hạn.', details: error.message });
    }
});


module.exports = router;