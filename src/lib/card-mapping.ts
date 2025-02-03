import { ratings, states } from '@/lib/sync/operation';
import { Rating, State } from 'ts-fsrs';

export const STATE_NUMBER_TO_NAME = {
  0: 'New',
  1: 'Learning',
  2: 'Review',
  3: 'Relearning',
} as Record<State, (typeof states)[number]>;

export const STATE_NAME_TO_NUMBER = {
  New: 0,
  Learning: 1,
  Review: 2,
  Relearning: 3,
} as Record<(typeof states)[number], State>;

export const RATING_NAME_TO_NUMBER = {
  Manual: 0,
  Again: 1,
  Hard: 2,
  Good: 3,
  Easy: 4,
} satisfies Record<(typeof ratings)[number], Rating>;

export const RATING_NUMBER_TO_NAME = {
  0: 'Manual',
  1: 'Easy',
  2: 'Good',
  3: 'Hard',
  4: 'Again',
} satisfies Record<Rating, (typeof ratings)[number]>;
