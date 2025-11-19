import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookingDate: { type: DataTypes.DATE(3), allowNull: false },
  checkInDate: { type: DataTypes.DATE(3), allowNull: false },
  checkOutDate: { type: DataTypes.DATE(3), allowNull: false },
  totalGuests: { type: DataTypes.SMALLINT, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'total_amount' },
  specialRequests: DataTypes.TEXT,
   status: { 
    type: DataTypes.ENUM('Pending', 'Confirmed', 'CheckedIn', 'Completed', 'Cancelled'),
    defaultValue: 'Pending', 
    allowNull: false 
},
  bookingSource: { type: DataTypes.ENUM('Website', 'Mobile App', 'Phone', 'Agent'), defaultValue: 'Website', allowNull: false },
  customerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Customers', key: 'id' } },
  discountId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'discounts', key: 'id' } },
  isHidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
  timestamps: true,
  tableName: 'booking'
});


export default Booking;
