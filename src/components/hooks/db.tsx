import MemoryDB from '@/lib/db/memory';
import { useSyncExternalStore } from 'react';

export function useReadCards() {
  const snapshot = useSyncExternalStore(
    MemoryDB.subscribe,
    MemoryDB.getSnapshot
  );
  return snapshot.getCards();
}

export function useReviewCards() {
  const cards = useReadCards();
  const reviewCards = cards.filter((card) => card.due < new Date());

  return reviewCards;
}
