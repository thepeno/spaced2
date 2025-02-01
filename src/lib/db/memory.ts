import { db } from '@/lib/db/persistence';
import { handleClientOperation, OperationWithId } from '@/lib/sync/operation';
import { CardWithMetadata } from '@/lib/types';

type MemoryDb = {
  cards: Record<string, CardWithMetadata>;
  operations: Record<string, OperationWithId>;
  metadataKv: Record<string, unknown>;
};

const memoryDb: MemoryDb = {
  cards: {},
  operations: {},
  metadataKv: {},
};

const subscribers = new Set<() => void>();

const subscribe = (callback: () => void): (() => void) => {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
};

const notify = () => {
  for (const callback of subscribers) {
    callback();
  }
};

const putCard = (card: CardWithMetadata) => {
  memoryDb.cards[card.id] = card;
};

const getCardById = (id: string) => {
  return memoryDb.cards[id];
};

const getCards = () => {
  return memoryDb.cards;
};

async function init() {
  const operations = await db.operations.toArray();
  for (const operation of operations) {
    handleClientOperation(operation);
  }
  notify();
  console.log('Spaced Database initialized');
}

init();

const MemoryDB = {
  subscribe,
  notify,
  putCard,
  getCards,
  getCardById,
};

export default MemoryDB;
