import { createPublicClient, http } from "viem";
import env from "../env";
import { mainnet } from "viem/chains";

const rpcUrl = env.RPC_URL;

export const client = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl),
});
