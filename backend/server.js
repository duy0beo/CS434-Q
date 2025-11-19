import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

//Import các routes
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js'; 
import roomTypeRoutes from './routes/roomTypeRoutes.js'; 
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from './routes/adminRoutes.js';
import supportRoutes from "./routes/supportRoutes.js";
import SupportTicket from './models/SupportTicket.js';
import SupportMessage from './models/SupportMessage.js';
import sequelize from './config/db.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Cho phép server truy cập vào các file trong thư mục 'public'
// Ví dụ: ảnh lưu ở 'public/images/room.jpg' có thể được truy cập qua URL '/images/room.jpg'
app.use(express.static('public'));

// Gắn các routes vào app
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes); 
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/api/users", userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

const PORT = process.env.PORT || 5000;

// sequelize.sync({ alter: true }).then(() => {
//     app.listen(PORT, () => console.log(`Server đang chạy ở cổng ${PORT}`));
// });

// Luôn khởi động server mà không cần đồng bộ hóa
app.listen(PORT, () => console.log(`Server đang chạy ở cổng ${PORT}`));