// This in-memory database is the data store for cards.
// We only persist operations, which are applied again every time we restart the app.
// An in-memory database is faster than fetching from IndexeDB whenever we need cards.
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

const subscribe = (callback: () => void = () => {}): (() => void) => {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
};

let cardsArray: CardWithMetadata[] = [];

const notify = () => {
  cardsArray = Object.values(memoryDb.cards);
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
  return cardsArray;
};

const MemoryDB = {
  subscribe,
  notify,
  putCard,
  getCards,
  getCardById,
};

export default MemoryDB;

async function init() {
  const operations = await db.operations.toArray();
  for (const operation of operations) {
    handleClientOperation(operation);
  }

  console.log('Spaced Database initialized');
  console.log(memoryDb.cards);
  notify();
}

await init();
