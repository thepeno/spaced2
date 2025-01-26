import { STATE_NUMBER_TO_NAME } from '@/lib/card-mapping';
import { CardWithContent } from '@/lib/types';
import { z } from 'zod';

export const states = ['New', 'Learning', 'Review', 'Relearning'] as const;

export const cardOperationSchema = z.object({
  type: z.literal('card'),
  payload: z.object({
    id: z.string(),
    // card variables
    due: z.coerce.date(),
    stability: z.number(),
    difficulty: z.number(),
    elapsed_days: z.number(),
    scheduled_days: z.number(),
    reps: z.number(),
    lapses: z.number(),
    state: z.enum(states),
    last_review: z.coerce.date().nullable(),
  }),
  timestamp: z.number(),
});

export type CardOperation = z.infer<typeof cardOperationSchema>;

export const cardContentOperationSchema = z.object({
  type: z.literal('cardContent'),
  payload: z.object({
    cardId: z.string(),
    front: z.string(),
    back: z.string(),
  }),
  timestamp: z.number(),
});

export type CardContentOperation = z.infer<typeof cardContentOperationSchema>;

export const operationSchema = z.union([
  cardOperationSchema,
  cardContentOperationSchema,
]);
export type Operation = z.infer<typeof operationSchema>;

/**
 * Auto incrementing id to order the operations when storing it.
 * The IDs are for client side ordering when sending to the server,
 * and will not be used by the server.
 */
export type OperationWithId = Operation & { id: number };

export function emptyCardToOperations(card: CardWithContent): Operation[] {
  const now = Date.now();
  const cardOperation: CardOperation = {
    type: 'card',
    payload: {
      id: card.id,
      due: card.due,
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: card.elapsed_days,
      scheduled_days: card.scheduled_days,
      reps: card.reps,
      lapses: card.lapses,
      state: STATE_NUMBER_TO_NAME[card.state],
      last_review: card.last_review ?? null,
    },
    timestamp: now,
  };

  // TODO: standardise to use question and answer instead of front and 
  // back
  const cardContentOperation: CardContentOperation = {
    type: 'cardContent',
    payload: {
      cardId: card.id,
      front: card.question,
      back: card.answer,
    },
    timestamp: now,
  };
  // TODO: add card deleted operation

  return [cardOperation, cardContentOperation];
}
