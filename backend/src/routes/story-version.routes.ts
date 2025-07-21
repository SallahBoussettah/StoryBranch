import { Router } from 'express';
import { StoryVersionController } from '../controllers/story-version.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

/**
 * Protected routes - require authentication
 */
// Get all versions for a story (only author or admin)
router.get(
    '/stories/:storyId/versions',
    protect,
    StoryVersionController.getStoryVersions
);

// Get specific version for a story (only author or admin)
router.get(
    '/stories/:storyId/versions/:versionNumber',
    protect,
    StoryVersionController.getStoryVersion
);

export default router;