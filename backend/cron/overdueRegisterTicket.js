const cron = require('node-cron');
const { Op } = require('sequelize');
const { PhieuDangKy, PhieuDangKyDonVi, ChungChiDangKy, PhieuDuThi, PhieuGiaHan, LichThi } = require('../models'); // Import your Sequelize models

function scheduleCleanupJob() {
    cron.schedule('0 0 * * *', async () => {
        console.log('Scheduled job started...');
        await cleanupExpiredRegistrations(); // Call the cleanup function
    });
}

async function cleanupExpiredRegistrations() {
  console.log('Running cleanup job for expired registrations (Sequelize)...');
  try {
      const currentDate = new Date();
      const phieuDangKyList = await PhieuDangKy.findAll();
      const affectedLichThiIds = new Set();

      for (const registration of phieuDangKyList) {
          const registrationDate = new Date(registration.ngaydangky); 
          const maxAllowedTime = 3 * 24 * 60 * 60 * 1000;

          const isOverdue = currentDate - registrationDate > maxAllowedTime;

          if (isOverdue) {
              // // Check if a non-expired PhieuGiaHan exists
              // const extension = await PhieuGiaHan.findOne({
              //     where: {
              //         idphieudangky: registration.idphieudangky,
              //         ngaygiahan: {
              //             [Op.gte]: new Date(currentDate.toISOString().split('T')[0]) // ignore time
              //         },
              //     },
              // });

              // if (extension) {
              //     // If a valid extension exists, skip this registration
              //     continue;
              // }

              // Mark as 'Qua han'
              await PhieuDangKy.update(
                  { trangthai: 'Qua han' },
                  { where: { idphieudangky: registration.idphieudangky } }
              );

              // Track affected LichThi IDs before deleting
              const phieuDuThis = await PhieuDuThi.findAll({
                  where: { idphieudangky: registration.idphieudangky },
              });

              for (const phieu of phieuDuThis) {
                  if (phieu.idlichthi) {
                      affectedLichThiIds.add(phieu.idlichthi);
                  }
              }

              // Cleanup
              await PhieuDuThi.destroy({
                  where: { idphieudangky: registration.idphieudangky },
              });

              await ChungChiDangKy.destroy({
                  where: { idphieudangky: registration.idphieudangky },
              });
          }
      }

      // Update SoLuongThiSinhHienTai for affected LichThi
      for (const idlichthi of affectedLichThiIds) {
          const count = await PhieuDuThi.count({
              where: { idlichthi },
          });

          await LichThi.update(
              { SoLuongThiSinhHienTai: count },
              { where: { idlichthi } }
          );
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