import { OperationWithId } from '@/lib/sync/operation';
import { Dexie, type EntityTable } from 'dexie';

export const db = new Dexie('SpacedDatabase') as Dexie & {
  operations: EntityTable<OperationWithId, 'id'>;
  // Store review logs in a separate table
  // as they are separate from the card-related logic and we can
  // save on startup time by not loading them from memory
  reviewLogOperations: EntityTable<OperationWithId, 'id'>;
  pendingOperations: EntityTable<OperationWithId, 'id'>;
  metadataKv: EntityTable<{ key: string; value: unknown }, 'key'>;
};

db.version(1).stores({
  operations: '++id, timestamp',
  reviewLogOperations: '++id, timestamp',
  pendingOperations: '++id, timestamp',
  metadataKv: 'key, value',
});
