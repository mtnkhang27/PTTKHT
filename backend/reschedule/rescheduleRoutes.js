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
  QuyDinhTrungTam, // Potentially needed for rules, though hardcoded here for simplicity
  PhongThi // Import PhongThi model
} = require('../models'); // Adjust the path based on your project structure

// Define associations if they are not already defined in your models file
// Assuming these associations are correctly defined in your ../models/index.js or individual model files
// If not, you would need to add them here or in your model definitions:
// PhieuDuThi.belongsTo(LichThi, { foreignKey: 'idlichthi', as: 'lichthi' });
// PhieuDuThi.belongsTo(PhieuDangKy, { foreignKey: 'idphieudangky', as: 'phieudangky' });
// PhieuDangKy.belongsTo(KhachHang, { foreignKey: 'idkhachhang' });
// LichThi.belongsTo(PhongThi, { foreignKey: 'idphong', as: 'phongthi' });
// LichThi.belongsTo(ChungChi, { foreignKey: 'chungchithi', as: 'chungchi' });


const FEE_GIA_HAN = 100000;

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
                        },
                        {
                            model: PhongThi, // Include PhongThi
                            as: 'phongthi', // Assuming LichThi belongsTo PhongThi with this alias
                            attributes: ['succhua', 'sochotrong'] // Select relevant room info
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

        // Find future exam schedules for the same certificate that have space in the room
        const availableDates = await LichThi.findAll({
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
            include: [
                {
                    model: PhongThi,
                    as: 'phongthi',
                    where: {
                        sochotrong: { [Op.gt]: 0 } // Filter for rooms with available slots
                    },
                    attributes: [] // Don't need phongthi attributes in the main result
                }
            ],
            attributes: ['idlichthi', 'ngaythi', 'giothi', 'diadiem'],
            order: [['ngaythi', 'ASC'], ['giothi', 'ASC']] // Order by date and time
        });


        if (availableDates.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy lịch thi mới phù hợp hoặc còn chỗ trống cho loại chứng chỉ này.' });
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
// Request body: { sobaodanh: number, idlichthimoi: number, idnhanvienLapDon: number, giahandacbiet: boolean }
router.post('/confirm', async (req, res) => {
    const { sobaodanh, idlichthimoi, idnhanvienLapDon, isSpecialCase } = req.body;
    let trangThaiThanhToan;
    let fee;
    if (isSpecialCase) {
        fee = 0;
        trangThaiThanhToan = "Da thanh toan";
    } else {
        fee = FEE_GIA_HAN, trangThaiThanhToan = "Chua thanh toan";
    }
    // Basic validation
    if (!sobaodanh || !idlichthimoi || !idnhanvienLapDon || typeof isSpecialCase === 'undefined') {
        return res.status(400).json({ error: 'Missing required fields (sobaodanh, idlichthimoi, idnhanvienLapDon, giahandacbiet).' });
    }

    const transaction = await sequelize.transaction(); // Start a transaction

    try {
        // Find the original exam ticket and its registration
        const phieuDuThi = await PhieuDuThi.findOne({
            where: { sobaodanh },
            include: [{ model: PhieuDangKy, as: 'phieudangky' }],
            transaction // Pass transaction
        });

        if (!phieuDuThi) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(404).json({ error: 'Phiếu dự thi không tồn tại.' });
        }

        if (!phieuDuThi.phieudangky) {
             await transaction.rollback(); // Rollback the transaction
             return res.status(400).json({ error: 'Không tìm thấy phiếu đăng ký liên quan.' });
        }

        // Find the selected new exam schedule and include its room
        const newLichThi = await LichThi.findOne({
            where: { idlichthi: idlichthimoi },
            include: [{ model: PhongThi, as: 'phongthi' }],
            transaction // Pass transaction
        });

        if (!newLichThi) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(404).json({ error: 'Lịch thi mới được chọn không tồn tại.' });
        }

        if (!newLichThi.phongthi) {
             await transaction.rollback(); // Rollback the transaction
             return res.status(400).json({ error: 'Lịch thi mới được chọn không có thông tin phòng thi.' });
        }

        // Check slot availability for the chosen new schedule
        if (newLichThi.phongthi.sochotrong <= 0) {
            await transaction.rollback(); // Rollback the transaction
            return res.status(400).json({ error: 'Lịch thi mới được chọn đã đầy chỗ.' });
        }


        // Create the PhieuGiaHan record
        const phieuGiaHan = await PhieuGiaHan.create({
            idphieudangky: phieuDuThi.idphieudangky,
            ngaygiahan: new Date(), // Record the date of the reschedule action
            nhanviengiahan: idnhanvienLapDon,
            lichthimoi: idlichthimoi, // Link to the new exam schedule
            trangthaithanhtoan: trangThaiThanhToan,
            phigiahan: fee
        }, { transaction }); // Pass transaction

        // Decrease the available slots in the new LichThi's room
        await PhongThi.update(
            { sochotrong: newLichThi.phongthi.sochotrong - 1 },
            { where: { idphong: newLichThi.phongthi.idphong }, transaction } // Pass transaction
        );

        // Optional: Update the status of the original PhieuDuThi
        // phieuDuThi.trangthai = 'rescheduled'; // Assuming a 'trangthai' field exists or is needed
        // await phieuDuThi.save({ transaction }); // Pass transaction

        // The description mentions adding to a list for new PhieuDuThi issuance.
        // This could be an internal system trigger based on the creation of PhieuGiaHan
        // or completion of payment (if pending).

        await transaction.commit(); // Commit the transaction

        res.status(201).json({
            success: true,
            message: 'Gia hạn thành công.',
            phieuGiaHan: phieuGiaHan
        });

    } catch (error) {
        await transaction.rollback(); // Rollback the transaction in case of error
        console.error('Error confirming reschedule:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi xác nhận gia hạn.', details: error.message });
    }
});


module.exports = router;