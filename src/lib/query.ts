import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export const useFlashcardReviewQuery = () => {
  return useLiveQuery(async () => {
    const cards = await db.cards
      .where('due')
      .belowOrEqual(new Date())
      .sortBy('id');

    return cards;
  });
};
