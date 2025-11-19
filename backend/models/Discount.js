import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Discount = sequelize.define('Discount', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(255), allowNull: false },
  percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  validFrom: { type: DataTypes.DATE(3), allowNull: false },
  validTo: { type: DataTypes.DATE(3), allowNull: false },
}, {
  timestamps: true,
  tableName: 'discounts',
  indexes: [
    { unique: true, fields: ['code'] }
  ]
});

export default Discount;
