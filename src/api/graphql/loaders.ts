import { listTransfersByHolders, type Transfer } from '../../services/transfers';
import DataLoader from 'dataloader';

export function makeTransfersByHolderLoader(token: string, limit: number) {
  return new DataLoader<string, Transfer[]>(async (holders) => {
    const rows = await listTransfersByHolders({ token, holders, limit });

    const byHolder = new Map<string, Transfer[]>();
    for (const h of holders) byHolder.set(h, []);

    for (const row of rows) {
      byHolder.get(row.fromAddress)?.push(row);
      if (row.toAddress !== row.fromAddress) {
        byHolder.get(row.toAddress)?.push(row);
      }
    }

    return holders.map((h) => byHolder.get(h) ?? []);
  });
}
