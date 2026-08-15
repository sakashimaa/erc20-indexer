import { parseAbiItem } from 'viem';

export const transferEvent = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
);

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
