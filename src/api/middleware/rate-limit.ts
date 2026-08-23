import { rateLimit } from 'express-rate-limit';
import { TooManyRequestsError } from '../lib/http-error';
import type { Request, Response, NextFunction } from 'express';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req: Request, res: Response, next: NextFunction) => {
    next(new TooManyRequestsError());
  },
});
