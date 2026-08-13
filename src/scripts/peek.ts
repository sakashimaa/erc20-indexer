import { erc20Abi, formatUnits, parseAbiItem } from "viem";
import { client } from "../chain/client.js";

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const;
const ZERO = "0x0000000000000000000000000000000000000000";

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);

async function main() {
  const [symbol, decimals] = await Promise.all([
    client.readContract({
      address: USDC,
      abi: erc20Abi,
      functionName: "symbol",
    }),
    client.readContract({
      address: USDC,
      abi: erc20Abi,
      functionName: "decimals",
    }),
  ]);
  console.log(`Token: ${symbol}, decimals: ${decimals}\n`);

  const head = await client.getBlockNumber();
  console.log(`Head block: ${head}\n`);

  const logs = await client.getLogs({
    address: USDC,
    event: transferEvent,
    fromBlock: head - 9n,
    toBlock: head,
    strict: true,
  });

  console.log(`Got ${logs.length} Transfer logs\n`);

  console.log("--- raw log ---");
  console.log(logs[0]);

  console.log("\n--- decoded ---");
  for (const log of logs.slice(0, 5)) {
    const { from, to, value } = log.args;
    console.log(
      `block ${log.blockNumber} | ${from} -> ${to} | ${formatUnits(value, decimals)} ${symbol}`,
    );
  }

  const mints = logs.filter((l) => l.args.from.toLowerCase() === ZERO);
  const burned = logs.filter((l) => l.args.to.toLowerCase() === ZERO);

  console.log(`mints: ${mints.length} burns: ${burned.length}`);

  const uniques = new Set([
    ...logs.map((l) => l.args.from),
    ...logs.map((l) => l.args.to),
  ]);

  console.log(uniques.size);
}

main().catch(console.error);
