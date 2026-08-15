import { createPublicClient, http } from 'viem';
import env from '../config/env.js';
import { mainnet } from 'viem/chains';

export const client = createPublicClient({
  chain: mainnet,
  transport: http(env.RPC_URL, {
    retryCount: 3,
    retryDelay: 1000,
    timeout: 30_000,
  }),
});
