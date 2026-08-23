import { BadRequestError } from './http-error';
import { cursorPayloadSchema } from '../schemas/transfers';
import logger from './logger';

interface Cursor {
  blockNumber: bigint;
  logIndex: number;
}

export function encodeCursor(c: Cursor): string {
  const json = JSON.stringify({ b: c.blockNumber.toString(), l: c.logIndex });
  return Buffer.from(json).toString('base64url');
}

export function decodeCursor(c: string): Cursor {
  try {
    const json = Buffer.from(c, 'base64url').toString('utf8');
    const r = cursorPayloadSchema.parse(JSON.parse(json));
    return {
      blockNumber: r.b,
      logIndex: r.l,
    };
  } catch (e) {
    logger.warn({ e }, 'invalid cursor format passed');
    throw new BadRequestError('invalid cursor format');
  }
}
