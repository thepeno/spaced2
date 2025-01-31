import { OperationWithId } from '@/lib/sync/operation';
import { Dexie, type EntityTable } from 'dexie';

export const db = new Dexie('SpacedDatabase') as Dexie & {
  operations: EntityTable<OperationWithId, 'id'>;
  pendingOperations: EntityTable<OperationWithId, 'id'>;
  metadataKv: EntityTable<{ key: string; value: unknown }, 'key'>;
};

db.version(1).stores({
  operations: '++id, timestamp',
  pendingOperations: '++id, timestamp',
  metadataKv: 'key, value',
});
