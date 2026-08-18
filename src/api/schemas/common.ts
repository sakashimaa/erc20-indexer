import z from 'zod';

export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'must be a valid Ethereum address')
  .transform((v) => v.toLowerCase());

export const tokenParamsSchema = z.object({
  address: addressSchema,
});
