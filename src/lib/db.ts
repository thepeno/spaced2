import { OperationWithId } from '@/lib/sync/operation';
import { CardWithMetadata } from '@/lib/types';
import { Dexie, type EntityTable } from 'dexie';

export const db = new Dexie('SpacedDatabase') as Dexie & {
  cards: EntityTable<CardWithMetadata, 'id'>;
  operations: EntityTable<OperationWithId, 'id'>;
  metadataKv: EntityTable<{ key: string; value: unknown }, 'key'>;
};

db.version(1).stores({
  cards: 'id, due, state',
  operations: '++id, timestamp',
  metadataKv: 'key, value',
});
