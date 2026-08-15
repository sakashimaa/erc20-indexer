import type { Log } from 'viem';
import type { transferEvent } from './abi';

export type TransferLog = Log<bigint, number, false, typeof transferEvent, true>;

export function toTransferRow(log: TransferLog, tokenAddress: string) {
  if (log.blockNumber === null || log.transactionHash === null || log.logIndex === null) {
    throw new Error('pending lock received - no block info');
  }

  if (log.blockTimestamp === null) {
    throw new Error(
      `RPC did not return blockTimestamp for block ${log.blockNumber}. ` +
        `Fallback to eth_getBlockByNumber`,
    );
  }

  return {
    id: `${log.transactionHash}-${log.logIndex}`,
    tokenAddress: tokenAddress.toLowerCase(),
    blockNumber: log.blockNumber,
    blockHash: log.blockHash,
    txHash: log.transactionHash,
    logIndex: log.logIndex,
    fromAddress: log.args.from.toLowerCase(),
    toAddress: log.args.to.toLowerCase(),
    value: log.args.value.toString(),
    blockTimestamp: new Date(Number(log.blockTimestamp) * 1000),
  };
}
