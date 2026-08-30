import {
  getHolder,
  type Holder,
  type HoldersList,
  holdersList,
} from '../../services/holders';
import { listTransfers, type Transfer } from '../../services/transfers';
import { decodeCursor, encodeCursor } from '../lib/cursor';

export const resolvers = {
  Query: {
    transfers: async (
      _parent: unknown,
      args: { first: number; token: string; after?: string },
    ) => {
      const cursor = args.after ? decodeCursor(args.after) : undefined;
      const rows = await listTransfers({
        limit: args.first,
        cursor,
        token: args.token.toLowerCase(),
      });

      const items = rows.items;

      const edges = items.map((row) => ({
        cursor: encodeCursor({
          blockNumber: row.blockNumber,
          logIndex: row.logIndex,
        }),
        node: row,
      }));

      return {
        edges,
        pageInfo: { hasNextPage: rows.hasMore, endCursor: edges.at(-1)?.cursor ?? null },
      };
    },
    holders: async (
      _parent: unknown,
      args: { limit: number; page: number; token: string },
    ) =>
      (
        await holdersList({
          limit: args.limit,
          page: args.page,
          token: args.token.toLowerCase(),
        })
      ).data,
    holder: async (_parent: unknown, args: { address: string; token: string }) =>
      getHolder({ holder: args.address, token: args.token.toLowerCase() }),
  },

  Transfer: {
    blockNumber: (t: Transfer) => t.blockNumber.toString(),
    blockTimestamp: (t: Transfer) => t.blockTimestamp.toISOString(),
    transactionHash: (t: Transfer) => t.txHash,
  },
  Holder: {
    address: (h: Holder) => h.holderAddress,
    updatedAtBlock: (h: Holder) => h.updatedAtBlock?.toString() ?? null,
    indexedFromBlock: (h: Holder) => h.indexedFromBlock?.toString() ?? null,
    lastProcessedBlock: (h: Holder) => h.lastProcessedBlock?.toString() ?? null,
  },
  HolderList: {
    address: (h: HoldersList) => h.holderAddress,
    updatedAtBlock: (h: HoldersList) => h.updatedAtBlock?.toString() ?? null,
  },
};
