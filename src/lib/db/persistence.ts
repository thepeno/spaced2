import { OperationWithId } from '@/lib/sync/operation';
import { Dexie, type EntityTable } from 'dexie';

export const db = new Dexie('SpacedDatabase') as Dexie & {
  operations: EntityTable<OperationWithId, '_id'>;
  // Store review logs in a separate table
  // as they are separate from the card-related logic and we can
  // save on startup time by not loading them from memory
  reviewLogOperations: EntityTable<OperationWithId, '_id'>;
  pendingOperations: EntityTable<OperationWithId, '_id'>;
  metadataKv: EntityTable<{ key: string; value: unknown }, 'key'>;
};

db.version(1).stores({
  operations: '++_id, timestamp',
  reviewLogOperations: '++_id, timestamp',
  pendingOperations: '++_id, timestamp',
  metadataKv: 'key, value',
});
