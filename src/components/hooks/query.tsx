import MemoryDB from '@/lib/db/memory';
import { useSyncExternalStore } from 'react';

export function useCards() {
  const snapshot = useSyncExternalStore(
    MemoryDB.subscribe,
    MemoryDB.getSnapshot
  );
  return snapshot.getCards();
}

export function useReviewCards() {
  const cards = useCards();
  const reviewCards = cards
    .filter((card) => card.due < new Date())
    .filter((card) => !card.suspended || card.suspended < new Date());

  return reviewCards;
}

export function useDecks() {
  const snapshot = useSyncExternalStore(
    MemoryDB.subscribe,
    MemoryDB.getSnapshot
  );
  return snapshot.getDecks();
}

export function useDeck(id: string) {
  const snapshot = useSyncExternalStore(
    MemoryDB.subscribe,
    MemoryDB.getSnapshot
  );
  return snapshot.getDeckById(id);
}

export function useCardsForDeck(deckId: string) {
  const snapshot = useSyncExternalStore(
    MemoryDB.subscribe,
    MemoryDB.getSnapshot
  );
  return snapshot.getCardsForDeck(deckId);
}

export function useCurrentCard() {
  const cards = useReviewCards();
  return cards[0];
}
