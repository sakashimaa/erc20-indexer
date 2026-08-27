import { describe, it, expect } from 'vitest';
import { decodeCursor, encodeCursor } from './cursor';
import { BadRequestError } from './http-error';

describe('decodeCursor', () => {
  it('round trip with encodeCursor', () => {
    const result = decodeCursor(encodeCursor({ blockNumber: 123n, logIndex: 123 }));

    expect(typeof result.blockNumber).toBe('bigint');
    expect(typeof result.logIndex).toBe('number');
    expect(result.blockNumber).toBe(123n);
    expect(result.logIndex).toBe(123);
  });

  it('zero logIndex in decode', () => {
    const result = decodeCursor(encodeCursor({ blockNumber: 123n, logIndex: 0 }));

    expect(result.logIndex).toBe(0);
    expect(result.blockNumber).toBe(123n);
  });

  it('big number', () => {
    const result = decodeCursor(
      encodeCursor({ blockNumber: 123456789012345678901234567890n, logIndex: 0 }),
    );

    expect(result.logIndex).toBe(0);
    expect(typeof result.blockNumber).toBe('bigint');
    expect(result.blockNumber).toBe(123456789012345678901234567890n);
  });

  it('bad request not base64', () => {
    expect(() => decodeCursor('lolkek')).toThrow(BadRequestError);
  });

  it('valid base64, not a JSON inside', () => {
    expect(() => decodeCursor(Buffer.from('hello').toString('base64url'))).toThrow(
      BadRequestError,
    );
  });

  it('valid JSON, invalid structure', () => {
    expect(() => decodeCursor(Buffer.from('{ "x": 1 }').toString('base64url'))).toThrow(
      BadRequestError,
    );
  });

  it('negative logIndex', () =>
    expect(() =>
      decodeCursor(
        Buffer.from(JSON.stringify({ b: 100n.toString(), l: -5 })).toString('base64url'),
      ),
    ).toThrow(BadRequestError));
});
