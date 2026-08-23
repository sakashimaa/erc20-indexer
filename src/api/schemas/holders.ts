import z from 'zod';
import { addressSchema } from './common';

export const holdersQuery = z.object({
  token: addressSchema,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export const holderParams = z.object({
  holder: addressSchema,
});

export const holderQuery = z.object({
  token: addressSchema,
});
