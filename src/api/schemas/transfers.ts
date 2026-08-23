import z from 'zod';
import { addressSchema } from './common';

export const cursorPayloadSchema = z.object({
  b: z.coerce.bigint().nonnegative(),
  l: z.coerce.number().int().nonnegative(),
});

export const transfersSchema = z.object({
  token: addressSchema,
  limit: z.coerce.number().int().min(1).max(20).default(20),
  cursor: z.string().optional(),
});
