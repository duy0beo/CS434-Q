import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Room = sequelize.define('Room', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roomNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
  floor: { type: DataTypes.SMALLINT, allowNull: false },
  status: { 
    type: DataTypes.ENUM('Available', 'Occupied', 'Maintenance'), 
    defaultValue: 'Available',
    allowNull: false 
  },
  notes: DataTypes.TEXT,
  roomTypeId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: true,
  tableName: 'room'
});


export default Room;
