import env from '../config/env';
import { queryClient } from '../db';
import { app as expressApp } from './app';
import logger from './lib/logger';

const server = expressApp.listen(env.HTTP_PORT, () => {
  logger.info(`server is running on port ${env.HTTP_PORT}`);
});

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    logger.info(`${signal} received, shutting down`);

    server.close(() => {
      void queryClient.end().then(() => process.exit(0));
    });

    setTimeout(() => process.exit(1), 10_000).unref();
  });
}

server.on('error', (err) => {
  logger.error({ err }, 'server failed to start');
  process.exit(1);
});
