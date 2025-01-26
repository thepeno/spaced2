import { states } from '@/lib/operation';
import { State } from 'ts-fsrs';

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
