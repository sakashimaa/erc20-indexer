import { type TokenMetadata } from '../services/tokens';

export interface TokenMetadataDto {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  indexedFromBlock: string;
  lastProcessedBlock: string | null;
  transferCount: number;
  holderCount: number;
}

export function toTokenMetadataDto(m: TokenMetadata): TokenMetadataDto {
  return {
    address: m.address,
    name: m.name,
    symbol: m.symbol,
    decimals: m.decimals,
    indexedFromBlock: m.indexedFromBlock.toString(),
    lastProcessedBlock: m.lastProcessedBlock ? m.lastProcessedBlock.toString() : null,
    transferCount: m.transferCount,
    holderCount: m.holderCount,
  };
}
