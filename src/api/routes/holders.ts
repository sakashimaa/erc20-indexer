import { Router } from 'express';
import type { Request, Response } from 'express';
import { holderParams, holderQuery, holdersQuery } from '../schemas/holders';
import { getHolder, holdersList } from '../../services/holders';
import { toHolderDto, toHoldersDto } from '../../dto/holders';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { token, limit, page } = holdersQuery.parse(req.query);

  const rows = await holdersList({ token, limit, page });

  const result = rows.data.map((r) => toHoldersDto(r));

  return res
    .status(200)
    .json({ data: result, totalPages: rows.totalPages, total: rows.total });
});

router.get('/:holder', async (req: Request, res: Response) => {
  const { holder } = holderParams.parse(req.params);
  const { token } = holderQuery.parse(req.query);

  const row = await getHolder({ holder, token });

  return res.status(200).json({ data: toHolderDto(row) });
});

export { router };
