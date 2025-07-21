import { Router } from 'express';
import { ChoiceController } from '../controllers/choice.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../generated/prisma';

const router = Router();

/**
 * Public routes (for published stories)
 */
// Get all choices for a node
router.get('/node/:nodeId', ChoiceController.getNodeChoices);

// Get choice by ID
router.get('/:id', ChoiceController.getChoiceById);

/**
 * Protected routes - require authentication
 */
// Create a new choice (writer or admin only)
router.post(
    '/node/:nodeId',
    protect,
    restrictTo(UserRole.WRITER, UserRole.ADMIN),
    ChoiceController.createChoice
);

// Update a choice (only author or admin)
router.put(
    '/:id',
    protect,
    ChoiceController.updateChoice
);

// Delete a choice (only author or admin)
router.delete(
    '/:id',
    protect,
    ChoiceController.deleteChoice
);

// Validate story structure integrity
router.get(
    '/validate/story/:storyId',
    protect,
    ChoiceController.validateStoryStructure
);

export default router;