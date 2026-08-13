import 'dotenv/config';
import z from 'zod';
import { fromError } from 'zod-validation-error';

const envSchema = z
  .object({
    RPC_URL: z.url(),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DB: z.string().min(1),
    POSTGRES_HOST: z.string().default('localhost'),
    POSTGRES_PORT: z.coerce.number().default(5433),
  })
  .transform((e) => ({
    ...e,
    DATABASE_URL: `postgres://${e.POSTGRES_USER}:${e.POSTGRES_PASSWORD}@${e.POSTGRES_HOST}:${e.POSTGRES_PORT}/${e.POSTGRES_DB}`,
  }));

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    '❌ ',
    fromError(parsed.error, {
      prefix: 'env validation error',
    }),
  );
}

const env = parsed.data!;

export { env };
export default env;
