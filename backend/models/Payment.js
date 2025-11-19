import { DataTypes, Transaction } from 'sequelize';
import sequelize from '../config/db.js';
import Booking from './Booking.js';

const Payment = sequelize.define('Payment', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    paymentDate: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    paymentMethod: {type:DataTypes.ENUM('credit_card', 'paypal', 'bank_transfer'), allowNull: false},
    transactionId: {type: DataTypes.STRING, unique: true, allowNull: false},
    status: {type:DataTypes.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending', allowNull: false},
    bookingId: {type: DataTypes.INTEGER, allowNull: false, references: {model: Booking, key: 'id'}},
    amount: {type: DataTypes.DECIMAL(10, 2), allowNull: false}

}, {
    timestamps: true,
    tableName: 'payment'
});
export default Payment;