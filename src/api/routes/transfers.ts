import { Router } from 'express';
import type { Request, Response } from 'express';
import { transfersSchema } from '../schemas/transfers';
import { listTransfers } from '../../services/transfers';
import { toListTransfersDto } from '../../dto/transfers';
import { decodeCursor, encodeCursor } from '../lib/cursor';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { token, limit, cursor } = transfersSchema.parse(req.query);

  const page = await listTransfers({
    token,
    limit,
    cursor: cursor ? decodeCursor(cursor) : undefined,
  });

  let nextCursor = null;
  if (page?.hasMore) {
    const last = page.items[page.items.length - 1]!;
    nextCursor = encodeCursor({
      blockNumber: last.blockNumber,
      logIndex: last.logIndex,
    });
  }

  const mappedTransfers = page.items.map((t) => toListTransfersDto(t));
  return res
    .status(200)
    .json({ data: mappedTransfers, pageInfo: { hasMore: page?.hasMore, nextCursor } });
});

export { router };
