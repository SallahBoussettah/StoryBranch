import { Router, Request, Response } from 'express';

const router = Router();

// Health check route
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;