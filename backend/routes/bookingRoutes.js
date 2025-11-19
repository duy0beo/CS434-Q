import express from 'express';
import { createBooking, getMyBookings, cancelBooking, hideBookingFromHistory,  } from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route để tạo một đơn đặt phòng mới
// Nó được bảo vệ bởi verifyToken, chỉ người dùng đã đăng nhập mới có thể gọi
router.post('/', verifyToken, createBooking);
router.get("/my", verifyToken, getMyBookings);
router.delete('/:id', verifyToken, cancelBooking);
router.patch('/:id/hide', verifyToken, hideBookingFromHistory);

export default router;