import env from '../config/env';
import { queryClient } from '../db';
import { app as expressApp, mountErrorHandlers } from './app';
import { mountGraphql } from './graphql/server';
import logger from './lib/logger';
import http from 'http';

const server = http.createServer(expressApp);

await mountGraphql(expressApp, server);
mountErrorHandlers(expressApp);

server.on('error', (err) => {
  logger.error({ err }, 'server failed to start');
  process.exit(1);
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

server.listen(env.HTTP_PORT, () => {
  logger.info(`listening on ${env.HTTP_PORT}`);
});
