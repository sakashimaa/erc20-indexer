import {
  getHolder,
  type Holder,
  type HoldersList,
  holdersList,
} from '../../services/holders';
import { listTransfers, type Transfer } from '../../services/transfers';
import { decodeCursor, encodeCursor } from '../lib/cursor';
import { type GraphQLContext } from './context';

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
    ) => {
      const token = args.token.toLowerCase();
      const { data } = await holdersList({ token, limit: args.limit, page: args.page });
      return data.map((row) => ({ ...row, tokenAddress: token }));
    },
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
  HolderTransfer: {
    blockNumber: (t: Transfer) => t.blockNumber.toString(),
    blockTimestamp: (t: Transfer) => t.blockTimestamp.toISOString(),
    transactionHash: (t: Transfer) => t.txHash,
  },
  HolderList: {
    address: (h: HoldersList) => h.holderAddress,
    updatedAtBlock: (h: HoldersList) => h.updatedAtBlock?.toString() ?? null,

    transfers: async (
      holder: HoldersList & { tokenAddress: string },
      args: { limit: number },
      ctx: GraphQLContext,
    ) => {
      const rows = await ctx
        .transfersByHolder(holder.tokenAddress, args.limit)
        .load(holder.holderAddress);

      return rows.slice(0, args.limit).map((row) => ({
        ...row,
        direction:
          row.fromAddress === row.toAddress
            ? 'SELF'
            : row.fromAddress === holder.holderAddress
              ? 'OUT'
              : 'IN',
      }));
    },
  },
};
