import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.get('/profile', protect, AuthController.getProfile);

export default router;