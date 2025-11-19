import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { verifyAdmin, verifyEmployee } from '../middleware/adminMiddleware.js';
import { getAllUsers, getAllCustomers, updateUser, getAllBookingsAdmin, updateBookingStatus, createEmployee, getAllEmployees } from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', verifyToken, verifyAdmin, getAllUsers);
router.get('/customers', verifyToken, verifyAdmin, getAllCustomers);
router.put('/users/:id', verifyToken, verifyAdmin, updateUser);
router.post('/employees', verifyToken, verifyAdmin, createEmployee);
router.get('/employees', verifyToken, verifyAdmin, getAllEmployees);

router.get('/bookings', verifyToken, verifyEmployee, getAllBookingsAdmin);
router.put('/bookings/:id/status', verifyToken, verifyEmployee, updateBookingStatus);

export default router;