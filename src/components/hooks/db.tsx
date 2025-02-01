import MemoryDB from '@/lib/db/memory';
import { useSyncExternalStore } from 'react';

export function useReadCards() {
  const cards = useSyncExternalStore(MemoryDB.subscribe, MemoryDB.getCards);
  return cards;
}

export function useReviewCards() {
  const cards = useReadCards();
  const reviewCards = cards.filter((card) => card.due < new Date());

  return reviewCards;
}
