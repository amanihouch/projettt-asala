// backend/src/models/SponsoredProduct.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SponsoredProduct = sequelize.define('SponsoredProduct', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  price: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true
  },
  oldPrice: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'SponsoredProducts',
  timestamps: true,
  indexes: [
    { fields: ['postId'] },
    { fields: ['isActive', 'endDate'] },
    { fields: ['displayOrder'] }
  ]
});

module.exports = SponsoredProduct;