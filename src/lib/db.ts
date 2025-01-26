import { OperationWithId } from '@/lib/operation';
import { CardWithContent } from '@/lib/types';
import { Dexie, type EntityTable } from 'dexie';

export const db = new Dexie('SpacedDatabase') as Dexie & {
  cards: EntityTable<CardWithContent, 'id'>;
  operations: EntityTable<OperationWithId, 'id'>;
};

db.version(1).stores({
  cards: 'id, due, state',
  operations: '++id, timestamp',
});
