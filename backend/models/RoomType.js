import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const RoomType = sequelize.define('RoomType', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false},
  description: DataTypes.TEXT,
  basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  maxOccupancy: { type: DataTypes.INTEGER, allowNull: false },
  photoUrl: DataTypes.STRING(255),
}, {
  tableName: 'room_type',
  timestamps: true,
});


export default RoomType;
