import { describe, expect, it } from 'vitest';
import { toTransferRow, type TransferLog } from './mapper';

const blockHash = ('0x' + 'b'.repeat(64)) as `0x${string}`;
const transactionHash = ('0x' + 'c'.repeat(64)) as `0x${string}`;

const ALICE = ('0x' + 'd'.repeat(40).toUpperCase()) as `0x${string}`;
const BOB = ('0x' + 'e'.repeat(40).toUpperCase()) as `0x${string}`;
const TOKEN = '0x' + 'f'.repeat(40);

function makeLog(overrides: Partial<TransferLog> = {}): TransferLog {
  return {
    blockNumber: 100n,
    logIndex: 5,
    transactionHash,
    blockHash,
    blockTimestamp: 1700000000n,
    args: { from: ALICE, to: BOB, value: 100n },
    ...overrides,
  } as TransferLog;
}

describe('toTransferRow', () => {
  it('returns transfer data', () => {
    const result = toTransferRow(makeLog(), TOKEN.toUpperCase());

    expect(result.id).toBe(`${transactionHash}-5`);
    expect(result.tokenAddress).toBe(TOKEN.toLowerCase());
    expect(result.fromAddress).toBe(ALICE.toLowerCase());
    expect(result.toAddress).toBe(BOB.toLowerCase());
    expect(result.value).toBe('100');
    expect(result.blockTimestamp.toISOString()).toEqual('2023-11-14T22:13:20.000Z');
  });

  it('throws when the RPC did not return blockTimestamp', () => {
    expect(() => toTransferRow(makeLog({ blockTimestamp: undefined }), TOKEN)).toThrow(
      /blockTimestamp/,
    );
  });

  it('throws when the blockNumber not set', () => {
    expect(() => toTransferRow(makeLog({ blockNumber: undefined }), TOKEN)).toThrow(
      /blockNumber/,
    );
  });

  it('throws when the transactionHash not set', () => {
    expect(() => toTransferRow(makeLog({ transactionHash: undefined }), TOKEN)).toThrow(
      /transactionHash/,
    );
  });

  it('throws when the logIndex not set', () => {
    expect(() => toTransferRow(makeLog({ logIndex: undefined }), TOKEN)).toThrow(
      /logIndex/,
    );
  });
});
