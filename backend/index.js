const express = require('express');
const sequelize = require('./database');
const { PhieuDuThi } = require('./models'); // Import your Sequelize models
const { ChungChi } = require('./models');
const cors = require('cors');
const paymentRoutes = require('./payment/paymentRoutes');
const registerRoutes = require('./register/registerRouter'); // Import the registerRouter

const app = express();
const port = 3458;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.get('/api/exam-tickets/', async (req, res) => {
  
    try {
      const phieuDuThi = await PhieuDuThi.findAll();
  
      console.log(phieuDuThi);
      res.json(phieuDuThi);
    } catch (error) {
      console.error('Error fetching certificate information:', error);
      res.status(500).json({ error: 'Failed to fetch certificate information' });
    }
  });

// API endpoint to get certificate information
app.get('/api/exam-tickets/:sobaodanh', async (req, res) => {
  const { sobaodanh } = req.params;

  try {
    // 1. Find the PhieuDuThi (Exam Ticket)
    const phieuDuThi = await PhieuDuThi.findOne({
      where: { sobaodanh: sobaodanh },
    });

    if (!phieuDuThi) {
      return res.status(404).json({ error: 'Exam ticket not found' });
    }


    res.json(phieuDuThi);
  } catch (error) {
    console.error('Error fetching certificate information:', error);
    res.status(500).json({ error: 'Failed to fetch certificate information' });
  }
});

// API endpoint to update certificate received confirmation
app.put('/api/exam-tickets/:sobaodanh/confirm', async (req, res) => {
  const { sobaodanh } = req.params;

  try {
    // 1. Find the PhieuDuThi
    const phieuDuThi = await PhieuDuThi.findOne({
      where: { sobaodanh: sobaodanh }
    });

    if (!phieuDuThi) {
      return res.status(404).json({ error: 'Exam ticket not found' });
    }

    // 2. Update the XacNhanNhanChungChi (Certificate Received Confirmation)
    phieuDuThi.xacnhannhanchungchi = true;
    await phieuDuThi.save();

    res.json({ message: 'Certificate received confirmation updated successfully' });
  } catch (error) {
    console.error('Error updating certificate confirmation:', error);
    res.status(500).json({ error: 'Failed to update certificate confirmation' });
  }
});

app.use('/api/payment', paymentRoutes);

app.use('/api/register', registerRoutes); // Use the registerRouter for handling registration-related routes

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});