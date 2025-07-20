import { Express } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import env from '../config/env.config';

export const setupSecurity = (app: Express): void => {
  // Apply Helmet for security headers
  app.use(helmet());

  // Set security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Rate limiting
  if (env.isProduction) {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });

    // Apply rate limiting to all requests
    app.use('/api/', limiter);
  }
};