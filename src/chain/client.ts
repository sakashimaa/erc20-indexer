import { createPublicClient, http } from 'viem';
import env from '../config/env.js';
import { mainnet } from 'viem/chains';

const rpcUrl = env.RPC_URL;

export const client = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl),
});
