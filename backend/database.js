const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('project', 'pttk', 'pttkht2025', {
    host: 'localhost', 
    port: 3457,
    dialect: 'postgres'
});

const testConnection = async () => {
try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}
};

testConnection(); // Call the test function

module.exports = sequelize;