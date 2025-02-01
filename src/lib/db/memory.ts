// This in-memory database is the data store for cards.
// We only persist operations, which are applied again every time we restart the app.
// An in-memory database is faster than fetching from IndexeDB whenever we need cards.
import { db } from '@/lib/db/persistence';
import { handleClientOperation, OperationWithId } from '@/lib/sync/operation';
import { CardWithMetadata, Deck } from '@/lib/types';

type InternalMemoryDB = {
  cards: Record<string, CardWithMetadata>;
  decks: Record<string, Deck>;
  decksToCards: Record<string, Record<string, number>>;
  operations: Record<string, OperationWithId>;
  metadataKv: Record<string, unknown>;
};

export type Snapshot = {
  putCard: (card: CardWithMetadata) => void;
  getCardById: (id: string) => CardWithMetadata | undefined;
  getCards: () => CardWithMetadata[];
  putDeck: (deck: Deck) => void;
  getDeckById: (id: string) => Deck | undefined;
  getDecks: () => Deck[];
  getCardsForDeck: (deckId: string) => CardWithMetadata[];
};

const memoryDb: InternalMemoryDB = {
  cards: {},
  decks: {},
  decksToCards: {},
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

const notify = () => {
  // Create a new object reference so that we can pass it to the `useSyncExternalStore` hook
  snapshot = Object.assign({}, snapshot);
  for (const callback of subscribers) {
    callback();
  }
};

const putCard = (card: CardWithMetadata) => {
  memoryDb.cards[card.id] = Object.assign({}, card);
};

/**
 * Returns a card by its id.
 * Includes deleted cards.
 */
const getCardById = (id: string) => {
  return memoryDb.cards[id];
};

/**
 * Returns all cards.
 * Does not include deleted cards.
 */
const getCards = () => {
  return Object.values(memoryDb.cards).filter((card) => !card.deleted);
};

const putDeck = (deck: Deck) => {
  memoryDb.decks[deck.id] = Object.assign({}, deck);
};

/**
 * Returns a deck by its id.
 * Includes deleted decks.
 */
const getDeckById = (id: string) => {
  return memoryDb.decks[id];
};

/**
 * Returns all decks.
 * Does not include deleted decks.
 */
const getDecks = () => {
  return Object.values(memoryDb.decks).filter((deck) => !deck.deleted);
};

/**
 * Returns all cards for a deck.
 * Does not include deleted cards.
 */
const getCardsForDeck = (deckId: string) => {
  const cardsMap = memoryDb.decksToCards[deckId];
  if (!cardsMap) {
    return [];
  }

  const cards = Object.entries(cardsMap)
    .filter(([, count]) => count % 2 == 1)
    .map(([cardId]) => memoryDb.cards[cardId])
    .filter((card) => !card.deleted);

  return cards;
};

let snapshot: Snapshot = {
  putCard,
  getCardById,
  getCards,
  putDeck,
  getDeckById,
  getDecks,
  getCardsForDeck,
};

/**
 * Returns a snapshot of the current state of the database.
 *
 * This is used by the `useSyncExternalStore` hook to subscribe to changes.
 */
const getSnapshot = () => {
  return snapshot;
};

const MemoryDB = {
  subscribe,
  notify,
  getSnapshot,
  _db: memoryDb,

  putCard,
  getCards,
  getCardById,
  putDeck,
  getDeckById,
  getDecks,
  getCardsForDeck,
};

export default MemoryDB;

async function init() {
  const operations = await db.operations.toArray();
  for (const operation of operations) {
    handleClientOperation(operation);
  }

  console.log('Spaced Database initialized');
  notify();
}

await init();
