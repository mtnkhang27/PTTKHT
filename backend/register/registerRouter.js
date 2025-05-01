const express = require('express');
const router = express.Router();
const sequelize = require('../database');

const { PhieuDuThi, PhieuDangKy, PhieuDangKyDonVi, NhanVien, HoaDon, ChungChiDangKy, ChungChi, LichThi } = require('../models'); // Import your Sequelize models

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
        // Fetch all schedules from the database
        const schedules = await LichThi.findAll({
            include: [
                {
                    model: ChungChi,
                    as: 'chungChi',
                    attributes: ['tenchungchi'],
                },
                {
                    model: NhanVien,
                    as: 'nhanVien',
                    attributes: ['hoten'],
                },
            ],
        });

        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});


router.post('/add-register', async (req, res) => {
    const { name, email, phone, address } = req.body;

    try {
        // Create a new PhieuDangKy (Registration Form) for individual
        const phieuDangKy = await PhieuDangKy.create({
            tenkhachhang: name,
            email: email,
            sodienthoai: phone,
            diachi: address,
            loai: 'individual',
        });

        res.status(201).json(phieuDangKy);
    } catch (error) {
        console.error('Error creating individual registration:', error);
        res.status(500).json({ error: 'Failed to create individual registration' });
    }
});

module.exports = router;