import express, { Router, type Express } from 'express';
import { router as tokensRouter } from './routes/tokens';
import { router as transfersRouter } from './routes/transfers';
import { router as holdersRouter } from './routes/holders';
import { pinoHttp } from 'pino-http';
import { logger as appLogger } from './lib/logger';
import { HttpError, NotFoundError } from './lib/http-error';
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';
import { apiLimiter } from './middleware/rate-limit';

const app = express();
app.use(express.json());

app.use(
  pinoHttp({
    logger: appLogger,
    customLogLevel: (_, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} - success (${res.statusCode})`,
    customErrorMessage: (req, _, err) =>
      `${req.method} ${req.url} - Failed: ${err?.message}`,
  }),
);

const apiRouter = Router();
const v1Router = Router();

v1Router.get('/health', (_: Request, res: Response) => res.json({ status: 'ok' }));

app.use('/api', apiRouter);
apiRouter.use('/v1', v1Router);

v1Router.use(apiLimiter);

v1Router.use('/tokens', tokensRouter);
v1Router.use('/transfers', transfersRouter);
v1Router.use('/holders', holdersRouter);

export function mountErrorHandlers(app: Express) {
  app.use((req, _res, next) =>
    next(new NotFoundError(`route ${req.method} ${req.path} not found`)),
  );
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ status: 'error', message: fromError(err).message });
    }

    if (err instanceof HttpError) {
      req.log.warn({ err, status: err.status }, 'http error');
      return res
        .status(err.status)
        .json({ status: 'error', message: err.message, code: err.code });
    }

    req.log.error({ err }, 'unhandled error');
    return res.status(500).json({ status: 'error', message: 'unknown error' });
  });
}

export { app };
