import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Booking from './Booking.js';
import Room from './Room.js';

const BookingItem = sequelize.define('BookingItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookingId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Booking, key: 'id' } },
  roomId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Room, key: 'id' } },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false, comment: "Giá thuê phòng tại thời điểm đặt" },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, comment: 'Số lượng (số đêm)' }
}, {
  tableName: 'booking_items',
  timestamps: true,
});


export default BookingItem;
