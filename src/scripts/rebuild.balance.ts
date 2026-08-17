import { count, eq, sql } from 'drizzle-orm';
import { db, queryClient } from '../db';
import env from '../config/env';
import { balances } from '../db/schema';

const ZERO = '0x0000000000000000000000000000000000000000';

async function main() {
  const token = env.TOKEN_ADDRESS;
  await db.transaction(async (tx) => {
    await tx.execute(sql`DELETE FROM balances WHERE token_address = ${token}`);

    await tx.execute(sql`
      INSERT INTO balances (token_address, holder_address, balance, updated_at_block)
      SELECT token_address, holder, SUM(delta), MAX(block_number)
      FROM (
        SELECT token_address, to_address AS holder,
               value::numeric AS delta, block_number
        FROM transfers
        WHERE token_address = ${token} AND to_address <> ${ZERO}

        UNION ALL

        SELECT token_address, from_address AS holder,
               -value::numeric AS delta, block_number
        FROM transfers
        WHERE token_address = ${token} AND from_address <> ${ZERO}
      ) AS movements
      GROUP BY token_address, holder
    `);
  });

  const [row] = await db
    .select({ n: count() })
    .from(balances)
    .where(eq(balances.tokenAddress, token));

  console.log(`rebuilt ${row?.n} balance rows`);
}

main()
  .catch((err) => {
    process.exitCode = 1;
    console.error(err);
  })
  .finally(() => queryClient.end());
