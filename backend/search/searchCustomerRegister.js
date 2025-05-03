const express = require('express');
const router = express.Router();
const sequelize = require('../database');

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

module.exports = router;
