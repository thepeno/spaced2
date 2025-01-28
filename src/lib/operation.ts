import { STATE_NAME_TO_NUMBER, STATE_NUMBER_TO_NAME } from '@/lib/card-mapping';
import { db } from '@/lib/db';
import { getSeqNo, setSeqNo } from '@/lib/sync/meta';
import { CardWithMetadata } from '@/lib/types';
import { createEmptyCard } from 'ts-fsrs';
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

export const cardDeletedOperationSchema = z.object({
  type: z.literal('cardDeleted'),
  payload: z.object({
    cardId: z.string(),
    deleted: z.boolean(),
  }),
  timestamp: z.number(),
});

export type CardDeletedOperation = z.infer<typeof cardDeletedOperationSchema>;

export const deckOperationSchema = z.object({
  type: z.literal('deck'),
  payload: z.object({
    id: z.string(),
    name: z.string(),
    deleted: z.boolean(),
    description: z.string(),
  }),
  timestamp: z.number(),
});

export type DeckOperation = z.infer<typeof deckOperationSchema>;

export const updateDeckCardOperationSchema = z.object({
  type: z.literal('updateDeckCard'),
  payload: z.object({
    deckId: z.string(),
    cardId: z.string(),
    clCount: z.number(),
  }),
  timestamp: z.number(),
});

export type UpdateDeckCardOperation = z.infer<
  typeof updateDeckCardOperationSchema
>;

export const operationSchema = z.union([
  cardOperationSchema,
  cardContentOperationSchema,
  cardDeletedOperationSchema,
  deckOperationSchema,
  updateDeckCardOperationSchema,
]);
export type Operation = z.infer<typeof operationSchema>;

/**
 * Auto incrementing id to order the operations when storing it.
 * The IDs are for client side ordering when sending to the server,
 * and will not be used by the server.
 */
export type OperationWithId = Operation & { id: number };
export type Server2Client<T extends Operation> = T & { seqNo: number };

export function emptyCardToOperations(card: CardWithMetadata): Operation[] {
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

  const cardDeletedOperation: CardDeletedOperation = {
    type: 'cardDeleted',
    payload: {
      cardId: card.id,
      deleted: false,
    },
    timestamp: now,
  };

  return [cardOperation, cardContentOperation, cardDeletedOperation];
}

/**
 * Creates a new card in the database
 *
 * Implementation is to merge the operations (without seqeuence number).
 * Doing so simplifies the implementation of the client side and ensures
 * consistency when updating the database.
 */
export async function createNewCard(question: string, answer: string) {
  const card: CardWithMetadata = {
    ...createEmptyCard(),
    id: crypto.randomUUID(),
    question,
    answer,

    // CRDT metadata
    cardLastModified: 0,
    cardContentLastModified: 0,
    cardDeletedLastModified: 0,
  };

  const operations = emptyCardToOperations(card);
  // TODO: should be handled as a single transaction
  for (const operation of operations) {
    const result = await handleClientOperation(operation);
    if (!result.applied) {
      throw new Error(
        'SHOULD NOT HAPPEN - there should not be conflict when creating new cards'
      );
    }
  }

  await db.operations.bulkAdd(operations);
}

type OperationResult = {
  applied: boolean;
};

async function handleCardOperation(
  operation: CardOperation
): Promise<OperationResult> {
  return db.transaction('rw', db.cards, db.metadataKv, async () => {
    const card = await db.cards.get(operation.payload.id);

    if (!card) {
      await db.cards.add({
        id: operation.payload.id,
        due: operation.payload.due,
        stability: operation.payload.stability,
        difficulty: operation.payload.difficulty,
        elapsed_days: operation.payload.elapsed_days,
        scheduled_days: operation.payload.scheduled_days,
        reps: operation.payload.reps,
        lapses: operation.payload.lapses,
        state: STATE_NAME_TO_NUMBER[operation.payload.state],
        last_review: operation.payload.last_review ?? undefined,

        created_at: operation.timestamp,

        // Default values for the other fields
        question: '',
        answer: '',
        deleted: false,

        // CRDT metadata
        cardLastModified: operation.timestamp,
        cardContentLastModified: 0,
        cardDeletedLastModified: 0,
      });
      return { applied: true };
    }

    // Unlike the server side, we don't have to bother with client timestamps as tiebreakers
    // as the operations applied are idempotent
    if (card.cardLastModified > operation.timestamp) {
      return { applied: false };
    }

    await db.cards.update(card.id, {
      due: operation.payload.due,
      stability: operation.payload.stability,
      difficulty: operation.payload.difficulty,
      elapsed_days: operation.payload.elapsed_days,
      scheduled_days: operation.payload.scheduled_days,
      reps: operation.payload.reps,
      lapses: operation.payload.lapses,
      state: STATE_NAME_TO_NUMBER[operation.payload.state],
      last_review: operation.payload.last_review ?? undefined,

      cardLastModified: operation.timestamp,
    });

    return { applied: true };
  });
}

async function handleCardContentOperation(
  operation: CardContentOperation
): Promise<OperationResult> {
  return db.transaction('rw', db.cards, async () => {
    const card = await db.cards.get(operation.payload.cardId);
    if (!card) {
      throw new Error(
        `Card content operation should not occur before card is created: ${JSON.stringify(
          operation,
          null,
          2
        )}`
      );
    }

    if (card.cardContentLastModified > operation.timestamp) {
      return { applied: false };
    }

    await db.cards.update(card.id, {
      question: operation.payload.front,
      answer: operation.payload.back,
      cardContentLastModified: operation.timestamp,
    });

    return { applied: true };
  });
}

async function handleCardDeletedOperation(
  operation: CardDeletedOperation
): Promise<OperationResult> {
  return db.transaction('rw', db.cards, async () => {
    const card = await db.cards.get(operation.payload.cardId);
    if (!card) {
      throw new Error(
        `Card deleted operation should not occur before card is created: ${JSON.stringify(
          operation,
          null,
          2
        )}`
      );
    }

    if (card.cardDeletedLastModified > operation.timestamp) {
      return { applied: false };
    }

    await db.cards.update(card.id, {
      deleted: operation.payload.deleted,
      cardDeletedLastModified: operation.timestamp,
    });

    return { applied: true };
  });
}

export async function handleClientOperation(
  operation: Operation
): Promise<OperationResult> {
  switch (operation.type) {
    case 'card':
      return handleCardOperation(operation);
    case 'cardContent':
      return handleCardContentOperation(operation);
    case 'cardDeleted':
      return handleCardDeletedOperation(operation);
    // TODO: add other operations
    default:
      throw new Error(`Unknown operation type: ${JSON.stringify(operation)}`);
  }
}

// We assume that the updates are being applied sequentially
// in order of seqNo (which is provided by the server)
// If this guarantee is violated, then we might miss out on some operations applied
// If the updates are applied sequentially, we can just update the sequence number
// whenever an operation succeeds in being applied
export async function handleServerOperation(
  operation: Server2Client<Operation>
) {
  const seqNo = await getSeqNo();

  if (seqNo >= operation.seqNo) {
    return;
  }

  const result = await handleClientOperation(operation);

  if (result.applied) {
    await setSeqNo(operation.seqNo);
    return;
  }
}

export async function applyServerOperations(
  operations: Server2Client<Operation>[]
) {
  for (const operation of operations) {
    await handleServerOperation(operation);
  }
}
