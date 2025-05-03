const cron = require('node-cron');
const { Op } = require('sequelize');
const { PhieuDangKy, PhieuDangKyDonVi, ChungChiDangKy, PhieuDuThi, PhieuGiaHan } = require('../models'); // Import your Sequelize models

function scheduleCleanupJob() {
    cron.schedule('0 0 * * *', async () => {
        console.log('Scheduled job started...');
        await cleanupExpiredRegistrations(); // Call the cleanup function
    });
}

async function cleanupExpiredRegistrations() {
    console.log('Running cleanup job for expired registrations (Sequelize)...');
    try {
        const phieuDangKy = await PhieuDangKy.findAll();

      for (const registration of phieuDangKy) {
        const currentDate = new Date();
        const registrationDate = new Date(registration.ngaydangky); // Assuming 'ngaytao' is the date field

        // Check if the registration is older than 30 days
        if (currentDate - registrationDate > 3 * 24 * 60 * 60 * 1000) {
          await PhieuDuThi.destroy({
            where: {
              idphieudangky: registration.idphieudangky,
            },
          });
          await ChungChiDangKy.destroy({
            where: {
              idphieudangky: registration.idphieudangky,
            },
          });
        }
      }
      console.log('Expired registrations cleanup completed.');

  
  
    } catch (error) {
      console.error('Error during Sequelize cleanup job:', error);
    } finally {
      console.log('Cleanup job finished.');
    }
}
  
module.exports = {
    scheduleCleanupJob,
    cleanupExpiredRegistrations
};