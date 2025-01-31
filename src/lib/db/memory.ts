import { db } from '@/lib/db/persistence';
import { handleClientOperation, OperationWithId } from '@/lib/sync/operation';
import { CardWithMetadata } from '@/lib/types';

type MemoryDb = {
  cards: Record<string, CardWithMetadata>;
  operations: Record<string, OperationWithId>;
  metadataKv: Record<string, unknown>;
};

export const memoryDb: MemoryDb = {
  cards: {},
  operations: {},
  metadataKv: {},
};

const subscribers = new Set<() => void>();

export const subscribe = (callback: () => void): (() => void) => {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
};

export const notify = () => {
  for (const callback of subscribers) {
    callback();
  }
};

async function init() {
  const operations = await db.operations.toArray();
  for (const operation of operations) {
    handleClientOperation(operation);
  }
  notify();
}

await init();
