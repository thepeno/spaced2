import { memoryDb, subscribe } from '@/lib/db/memory';
import { CardWithMetadata } from '@/lib/types';
import { useEffect, useState } from 'react';

export function useReadCards() {
  const [state, setState] = useState<CardWithMetadata[]>(
    Object.values(memoryDb.cards)
  );

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setState(Object.values(memoryDb.cards));
    });

    return () => unsubscribe();
  }, []);

  return state;
}

export function useReviewCards() {
  const cards = useReadCards();
  const reviewCards = cards.filter((card) => card.due < new Date());

  return reviewCards;
}
