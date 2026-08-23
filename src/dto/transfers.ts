import type { Transfer } from '../services/transfers';

export interface ListTransfersDto {
  id: string;
  txHash: string;
  tokenAddress: string;
  blockNumber: string;
  blockHash: string;
  logIndex: number;
  fromAddress: string;
  toAddress: string;
  value: string;
  blockTimestamp: string;
}

export function toListTransfersDto(t: Transfer): ListTransfersDto {
  return {
    id: t.id,
    txHash: t.txHash,
    tokenAddress: t.tokenAddress,
    blockNumber: t.blockNumber.toString(),
    blockHash: t.blockHash,
    logIndex: t.logIndex,
    fromAddress: t.fromAddress,
    toAddress: t.toAddress,
    value: t.value,
    blockTimestamp: t.blockTimestamp.toISOString(),
  };
}
