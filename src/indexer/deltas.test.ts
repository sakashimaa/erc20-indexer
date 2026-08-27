import { ZERO_ADDRESS } from './abi';
import { foldDeltas } from './deltas';
import { type TransferLog } from './mapper';
import { describe, it, expect } from 'vitest';

const ALICE = '0x' + 'a'.repeat(40);
const BOB = '0x' + 'b'.repeat(40);
const CAROL = '0x' + 'c'.repeat(40);

function log(from: string, to: string, value: bigint): TransferLog {
  return { args: { from, to, value } } as TransferLog;
}

describe('foldDeltas', () => {
  it('produces a negative delta for the sender and positive for receiver', () => {
    const result = foldDeltas([log(ALICE.toUpperCase(), BOB, 100n)]);

    expect(result.get(ALICE)).toBe(-100n);
    expect(result.get(BOB)).toBe(100n);
  });

  it('records only the receiver on mint', () => {
    const result = foldDeltas([log(ZERO_ADDRESS, ALICE.toUpperCase(), 100n)]);

    expect(result.has(ZERO_ADDRESS)).toBe(false);
    expect(result.get(ALICE)).toBe(100n);
    expect(result.size).toBe(1);
  });

  it('records only the sender on burn', () => {
    const result = foldDeltas([log(ALICE.toUpperCase(), ZERO_ADDRESS, 100n)]);

    expect(result.has(ZERO_ADDRESS)).toBe(false);
    expect(result.get(ALICE)).toBe(-100n);
    expect(result.size).toBe(1);
  });

  it('records nothing on zero address transfer', () => {
    const result = foldDeltas([log(ZERO_ADDRESS, ZERO_ADDRESS, 100n)]);

    expect(result.size).toBe(0);
  });

  it('accumulates multiple transfers for the same address', () => {
    const result = foldDeltas([log(ALICE, BOB, 100n), log(BOB, CAROL, 30n)]);

    expect(result.get(ALICE)).toBe(-100n);
    expect(result.get(BOB)).toBe(70n);
    expect(result.get(CAROL)).toBe(30n);
  });

  it('nets out a self-transfer to zero', () => {
    const result = foldDeltas([log(ALICE, ALICE, 100n)]);

    expect(result.get(ALICE)).toBe(0n);
  });

  it('produces empty result on empty array', () => {
    const result = foldDeltas([]);

    expect(result.size).toBe(0);
  });
});
