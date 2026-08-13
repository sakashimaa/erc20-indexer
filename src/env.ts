import "dotenv/config";
import z from "zod";
import { fromError } from "zod-validation-error";

const envSchema = z.object({
  RPC_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;
let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (e) {
  if (e instanceof z.ZodError) {
    const validationError = fromError(e, {
      prefix: "dotenv config validation error",
    });

    console.error("❌ " + validationError.message);
    process.exit(1);
  }

  throw e;
}

export { env };
export default env;
