import type { Holder, HoldersList } from '../services/holders';

export interface HoldersDto {
  holderAddress: string;
  balance: string;
  updatedAtBlock: string;
}

export interface HolderDto {
  holderAddress: string;
  tokenAddress: string;
  balance: string;
  updatedAtBlock: string | null;
  indexedFromBlock: string | null;
  lastProcessedBlock: string | null;
}

export function toHoldersDto(h: HoldersList): HoldersDto {
  return {
    holderAddress: h.holderAddress,
    balance: h.balance,
    updatedAtBlock: h.updatedAtBlock.toString(),
  };
}

export function toHolderDto(h: Holder): HolderDto {
  return {
    holderAddress: h.holderAddress,
    tokenAddress: h.tokenAddress,
    balance: h.balance,
    updatedAtBlock: h.updatedAtBlock?.toString() ?? null,
    indexedFromBlock: h.indexedFromBlock?.toString() ?? null,
    lastProcessedBlock: h.lastProcessedBlock?.toString() ?? null,
  };
}
