import MemoryDB from '@/lib/db/memory';
import { reviewSession } from '@/lib/review-session';
import { useSyncExternalStore } from 'react';

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function useCards() {
  const snapshot = useSyncExternalStore(
    MemoryDB.subscribe,
    MemoryDB.getSnapshot
  );
  return snapshot.getCards();
}

export function useReviewCards(deckId?: string) {
  const cards = deckId ? useCardsForDeck(deckId) : useCards();
  const sessionSnapshot = useSyncExternalStore(
    reviewSession.subscribe.bind(reviewSession),
    reviewSession.getSnapshot.bind(reviewSession)
  );

  // Get cards due for review based on their scheduled time
  const scheduledReviewCards = cards
    .filter((card) => card.due < new Date())
    .filter((card) => !card.suspended || card.suspended < new Date());

  // Get cards in immediate review queue (marked "Again" in current session)
  const immediateReviewCards = cards
    .filter((card) => sessionSnapshot.immediateReviewCards.includes(card.id))
    .filter((card) => !card.suspended || card.suspended < new Date());

  // Combine both sets, with immediate review cards prioritized
  const allReviewCards = [
    ...immediateReviewCards,
    ...scheduledReviewCards.filter(card => !sessionSnapshot.isInImmediateReview(card.id))
  ];

  // Sort deterministically by id for consistent "randomization"
  return allReviewCards.sort((a, b) => hashId(a.id) - hashId(b.id));
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

export function useUndoStack() {
  const snapshot = useSyncExternalStore(
    MemoryDB.subscribe,
    MemoryDB.getSnapshot
  );
  return snapshot.getUndoStack();
}
