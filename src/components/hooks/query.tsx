import MemoryDB from '@/lib/db/memory';
import { reviewSession } from '@/lib/review-session';
import { useSyncExternalStore } from 'react';
import { State } from 'ts-fsrs';

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
  const cardsForDeck = useCardsForDeck(deckId || '');
  const allCards = useCards();
  const cards = deckId ? cardsForDeck : allCards;
  const deck = deckId ? useDeck(deckId) : null;
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
  let allReviewCards = [
    ...immediateReviewCards,
    ...scheduledReviewCards.filter(card => !sessionSnapshot.isInImmediateReview(card.id))
  ];

  // Apply new cards per day limit ONLY if reviewing a specific deck
  if (deckId && deck && deck.newCardsPerDay !== undefined) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count how many new cards were reviewed for the first time today
    // A card is considered "newly reviewed today" if:
    // 1. It has been reviewed exactly once (reps === 1)
    // 2. That review happened today (last_review is today)
    const newCardsReviewedToday = cards.filter(card => {
      if (card.reps === 1 && card.last_review) {
        const lastReview = new Date(card.last_review);
        lastReview.setHours(0, 0, 0, 0);
        return lastReview.getTime() === today.getTime();
      }
      return false;
    }).length;

    // Separate new cards from other cards
    const newCards = allReviewCards.filter(card => card.state === State.New);
    const otherCards = allReviewCards.filter(card => card.state !== State.New);

    // Limit new cards based on deck setting
    const newCardsLimit = Math.max(0, deck.newCardsPerDay - newCardsReviewedToday);
    const limitedNewCards = newCards.slice(0, newCardsLimit);

    // Combine limited new cards with other cards
    allReviewCards = [...otherCards, ...limitedNewCards];
  }

  // Sort deterministically by id for consistent "randomization"
  // For new cards (State.New), add extra mixing to separate forward/reverse pairs
  const newCards = allReviewCards.filter(card => card.state === State.New);
  const oldCards = allReviewCards.filter(card => card.state !== State.New);

  if (newCards.length > 0) {
    // Sort new cards with a compound hash that factors in isReverse to spread them apart
    newCards.sort((a, b) => {
      // Create a modified hash that includes reverse flag
      const hashA = hashId(a.id) + (a.isReverse ? 1000000 : 0);
      const hashB = hashId(b.id) + (b.isReverse ? 1000000 : 0);
      return hashA - hashB;
    });
  }

  // Sort old cards normally
  oldCards.sort((a, b) => hashId(a.id) - hashId(b.id));

  // Interleave old cards first (priority), then new cards
  return [...oldCards, ...newCards];
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
