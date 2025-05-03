const express = require('express');
const path = require('path');
const { PhieuDuThi } = require('../models'); 

const router = express.Router();

// Serve static invoices
router.use('/invoices', express.static(path.join(__dirname, '../invoices')));

// GET all exam tickets
router.get('/', async (req, res) => {
  try {
    const phieuDuThi = await PhieuDuThi.findAll();
    res.json(phieuDuThi);
  } catch (error) {
    console.error('Error fetching exam tickets:', error);
    res.status(500).json({ error: 'Failed to fetch exam tickets' });
  }
});

// GET exam ticket by SBD
router.get('/:sobaodanh', async (req, res) => {
  const { sobaodanh } = req.params;

  try {
    const phieuDuThi = await PhieuDuThi.findOne({ where: { sobaodanh } });

    if (!phieuDuThi) {
      return res.status(404).json({ error: 'Exam ticket not found' });
    }

    res.json(phieuDuThi);
  } catch (error) {
    console.error('Error fetching exam ticket:', error);
    res.status(500).json({ error: 'Failed to fetch exam ticket' });
  }
});

// PUT confirm certificate received
router.put('/:sobaodanh/confirm', async (req, res) => {
  const { sobaodanh } = req.params;

  try {
    const phieuDuThi = await PhieuDuThi.findOne({ where: { sobaodanh } });

    if (!phieuDuThi) {
      return res.status(404).json({ error: 'Exam ticket not found' });
    }

    phieuDuThi.xacnhannhanchungchi = true;
    await phieuDuThi.save();

    res.json({ message: 'Certificate received confirmation updated successfully' });
  } catch (error) {
    console.error('Error updating certificate confirmation:', error);
    res.status(500).json({ error: 'Failed to update certificate confirmation' });
  }
});

module.exports = router;
