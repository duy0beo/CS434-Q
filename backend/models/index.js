// backend/src/models/index.js

import { Sequelize } from 'sequelize';
import sequelize from '../config/db.js';

// Import tất cả các model
import User from './User.js';
import Customer from './Customer.js';
import Booking from './Booking.js';
import BookingItem from './BookingItem.js';
import Room from './Room.js';
import RoomType from './RoomType.js';
import Review from './Review.js';
import SupportTicket from './SupportTicket.js';
import SupportMessage from './SupportMessage.js';

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Gán các model vào đối tượng db
db.User = User;
db.Customer = Customer;
db.Booking = Booking;
db.BookingItem = BookingItem;
db.Room = Room;
db.RoomType = RoomType;
db.Review = Review;
db.SupportTicket = SupportTicket;
db.SupportMessage = SupportMessage;

// =======================================================
// == ĐỊNH NGHĨA TẤT CẢ CÁC MỐI QUAN HỆ TẠI ĐÂY ==
// =======================================================

// User <-> Customer
db.User.hasOne(db.Customer, { foreignKey: 'userId', as: 'customer' });
db.Customer.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Customer <-> Booking
db.Customer.hasMany(db.Booking, { foreignKey: 'customerId', as: 'bookings' });
db.Booking.belongsTo(db.Customer, { foreignKey: 'customerId', as: 'customer' });

// Booking <-> BookingItem
db.Booking.hasMany(db.BookingItem, { foreignKey: 'bookingId', as: 'items' });
db.BookingItem.belongsTo(db.Booking, { foreignKey: 'bookingId', as: 'booking' });

// Booking <-> Review
db.Booking.hasOne(db.Review, { foreignKey: 'bookingId', as: 'review' });
db.Review.belongsTo(db.Booking, { foreignKey: 'bookingId', as: 'booking' });

// Room <-> BookingItem
db.Room.hasMany(db.BookingItem, { foreignKey: 'roomId', as: 'bookingItems' });
db.BookingItem.belongsTo(db.Room, { foreignKey: 'roomId', as: 'room' });

// RoomType <-> Room
db.RoomType.hasMany(db.Room, { foreignKey: 'roomTypeId', as: 'rooms' });
db.Room.belongsTo(db.RoomType, { foreignKey: 'roomTypeId', as: 'roomType' });

// SupportTicket <-> User (Customer)
db.SupportTicket.belongsTo(db.User, { as: "customer", foreignKey: "customerId" });
db.User.hasMany(db.SupportTicket, { as: "customerTickets", foreignKey: "customerId" });

// SupportTicket <-> User (Assignee)
db.User.hasMany(db.SupportTicket, { as: "assignedTickets", foreignKey: "assignedTo" });
db.SupportTicket.belongsTo(db.User, { as: "assignee", foreignKey: "assignedTo" });

// SupportTicket <-> SupportMessage
db.SupportTicket.hasMany(db.SupportMessage, { as: "messages", foreignKey: "ticketId" });
db.SupportMessage.belongsTo(db.SupportTicket, { as: "ticket", foreignKey: "ticketId" });

// SupportMessage <-> User (Sender)
db.SupportMessage.belongsTo(db.User, { as: "sender", foreignKey: "senderId" });
db.User.hasMany(db.SupportMessage, { as: "sentMessages", foreignKey: "senderId" });
// =======================================================



export default db;