const express = require('express');
const sequelize = require('./database');
const { PhieuDuThi } = require('./models'); // Import your Sequelize models
const { ChungChi } = require('./models');
const cors = require('cors');
const paymentRoutes = require('./payment/paymentRoutes');
const registerRoutes = require('./register/registerRouter'); // Import the registerRouter
const examTicketRoutes = require('./examTicket/examTicket');
const rescheduleRoutes = require('./reschedule/reschedule') 
const path = require('path'); // ✅ Thêm dòng này



const app = express();
const port = 3458;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use('/api/reschedule', rescheduleRoutes);

app.use('/api/exam-tickets', examTicketRoutes);

app.use('/api/payment', paymentRoutes);

app.use('/api/register', registerRoutes); // Use the registerRouter for handling registration-related routes

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});