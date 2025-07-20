import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../generated/prisma';

const router = Router();

// Protected routes for all authenticated users
router.use(protect);

// User profile routes
router.get('/me', UserController.getProfile);
router.get('/me/detailed', UserController.getDetailedProfile);
router.patch('/me', UserController.updateProfile);
router.patch('/me/password', UserController.changePassword);
router.delete('/me', UserController.deleteUser);

// Role management routes
router.post('/me/role-upgrade', UserController.requestRoleUpgrade);
router.get('/role-upgrade-requests', restrictTo(UserRole.ADMIN), UserController.getRoleUpgradeRequests);

// Admin-only routes
router.get('/', restrictTo(UserRole.ADMIN), UserController.listUsers);
router.get('/:id', restrictTo(UserRole.ADMIN), UserController.getUserById);
router.patch('/:id/role', restrictTo(UserRole.ADMIN), UserController.updateUserRole);

export default router;