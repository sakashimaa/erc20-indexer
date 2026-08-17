import { ZERO_ADDRESS } from './abi';
import { type TransferLog } from './mapper';

export function foldDeltas(logs: TransferLog[]): Map<string, bigint> {
  const deltas = new Map<string, bigint>();

  const apply = (address: string, amount: bigint) => {
    const addr = address.toLowerCase();
    if (addr === ZERO_ADDRESS) return;

    deltas.set(addr, (deltas.get(addr) ?? 0n) + amount);
  };

  for (const log of logs) {
    apply(log.args.from, -log.args.value);
    apply(log.args.to, log.args.value);
  }

  return deltas;
}
