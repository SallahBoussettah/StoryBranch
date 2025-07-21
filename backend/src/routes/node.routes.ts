import { Router } from 'express';
import { NodeController } from '../controllers/node.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../generated/prisma';

const router = Router();

/**
 * Public routes (for published stories)
 */
// Get all nodes for a story
router.get('/story/:storyId', NodeController.getStoryNodes);

// Get node by ID
router.get('/:id', NodeController.getNodeById);

/**
 * Protected routes - require authentication
 */
// Create a new node (writer or admin only)
router.post(
    '/story/:storyId',
    protect,
    restrictTo(UserRole.WRITER, UserRole.ADMIN),
    NodeController.createNode
);

// Update a node (only author or admin)
router.put(
    '/:id',
    protect,
    NodeController.updateNode
);

// Delete a node (only author or admin)
router.delete(
    '/:id',
    protect,
    NodeController.deleteNode
);

export default router;