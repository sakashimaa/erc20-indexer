import { Router } from 'express';
import type { Request, Response } from 'express';
import { getTokenMetadata } from '../../services/tokens';
import { NotFoundError } from '../lib/http-error';
import { toTokenMetadataDto } from '../../dto/tokens';
import { tokenParamsSchema } from '../schemas/common';

const router = Router();

router.get('/:address', async (req: Request, res: Response) => {
  const { address } = tokenParamsSchema.parse(req.params);

  const metadata = await getTokenMetadata(address);
  if (!metadata) {
    throw new NotFoundError('token not found');
  }

  return res.status(200).json(toTokenMetadataDto(metadata));
});

export { router };
