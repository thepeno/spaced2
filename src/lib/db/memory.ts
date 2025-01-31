import { OperationWithId } from '@/lib/sync/operation';
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
