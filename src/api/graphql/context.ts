import type DataLoader from 'dataloader';
import { type Transfer } from '../../services/transfers';

export interface GraphQLContext {
  transfersByHolder: (token: string, limit: number) => DataLoader<string, Transfer[]>;
}
