import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken'; 

// --- VALIDATION LOGIC ---

// Middleware để kiểm tra dữ liệu khi đăng ký
export const validateRegistration = [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Middleware để kiểm tra dữ liệu khi đăng nhập
export const validateLogin = [
    body('email', 'Email không hợp lệ').isEmail(),
    body('password', 'Mật khẩu là bắt buộc').exists(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// --- RATE LIMITING LOGIC ---

// Middleware để giới hạn số lần request cho endpoint đăng nhập
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 10, // Giới hạn mỗi IP chỉ được 10 request trong 15 phút
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// --- TOKEN VERIFICATION LOGIC ---
// Middleware để xác thực JWT token
export const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Gắn thông tin user đã giải mã vào đối tượng request
        req.user = decoded;
        // Chuyển sang middleware hoặc controller tiếp theo
        next();
    } catch (err) {
        console.error('Invalid token:', err.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};