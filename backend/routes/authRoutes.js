import { Router } from 'express';
// Dùng require cho nhất quán nếu controller cũng dùng module.exports
import { register, login} from '../controllers/authController.js';

import { validateRegistration, validateLogin, loginLimiter } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', [loginLimiter, validateLogin], login);

export default router;