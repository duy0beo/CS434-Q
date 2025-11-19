// src/routes/payment.routes.js
import express from 'express';
import { createPaymentUrl, vnpayIpn, vnpayReturn } from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-payment-url', verifyToken, createPaymentUrl);
router.get('/vnpay-ipn', vnpayIpn);
router.get('/vnpay-return', vnpayReturn);

export default router;