import type { ZodType } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../lib/http-error';
import { fromError } from 'zod-validation-error';

export function validateParams<T extends ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return next(new BadRequestError(fromError(result.error).message));
    }

    res.locals.params = result.data;
    next();
  };
}
