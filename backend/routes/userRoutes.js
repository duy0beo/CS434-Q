import express from 'express';
import { getMe, updateUserProfile, uploadAvatar, changePassword, forgotPassword, resetPassword } from '../controllers/userController.js'; 
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../config/multerConfig.js'; 

const router = express.Router();

router.get('/me', verifyToken, getMe);
router.put('/me/profile', verifyToken, updateUserProfile);
router.post('/upload-avatar', verifyToken, upload.single('avatar'), uploadAvatar);

router.put('/change-password', verifyToken, changePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;