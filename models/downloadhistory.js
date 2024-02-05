const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const DownloadHistory = sequelize.define('download_history', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  fileURL: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  downloadDate: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

module.exports = DownloadHistory;
