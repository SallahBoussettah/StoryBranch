import { Router } from 'express';
import { StoryController } from '../controllers/story.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../generated/prisma';

const router = Router();

/**
 * Public routes
 */
// Get all published stories
router.get('/', StoryController.getAllStories);

/**
 * Protected routes - require authentication
 */
// Get current user's stories - this route must come before '/:id' to avoid conflicts
router.get('/my', protect, StoryController.getMyStories);

// Get story by ID (public for published stories, protected for drafts/archived)
router.get('/:id', StoryController.getStoryById);

// Create a new story (writer or admin only)
router.post(
    '/',
    protect,
    restrictTo(UserRole.WRITER, UserRole.ADMIN),
    StoryController.createStory
);

// Update a story (only author or admin)
router.put(
    '/:id',
    protect,
    StoryController.updateStory
);

// Delete a story (only author or admin)
router.delete(
    '/:id',
    protect,
    StoryController.deleteStory
);

// Validate story structure before publishing (only author or admin)
router.get(
    '/:id/validate',
    protect,
    StoryController.validateStoryForPublishing
);

// Publish a story (only author or admin)
router.post(
    '/:id/publish',
    protect,
    StoryController.publishStory
);

// Archive a story (only author or admin)
router.post(
    '/:id/archive',
    protect,
    StoryController.archiveStory
);

export default router;