import { ApolloServer } from '@apollo/server';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import cors from 'cors';
import { type Express } from 'express';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import type http from 'http';
import type DataLoader from 'dataloader';
import { type Transfer } from '../../services/transfers';
import { makeTransfersByHolderLoader } from './loaders';

export async function mountGraphql(app: Express, httpServer: http.Server) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  app.use(
    '/graphql',
    cors(),
    expressMiddleware(server, {
      // eslint-disable-next-line @typescript-eslint/require-await
      context: async () => {
        const loaders = new Map<string, DataLoader<string, Transfer[]>>();
        return {
          transfersByHolder: (token: string, limit: number) => {
            const key = `${token}:${limit}`;
            let loader = loaders.get(key);
            if (!loader) {
              loader = makeTransfersByHolderLoader(token, limit);
              loaders.set(key, loader);
            }

            return loader;
          },
        };
      },
    }),
  );
}
