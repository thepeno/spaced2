import { STATE_NAME_TO_NUMBER, STATE_NUMBER_TO_NAME } from '@/lib/card-mapping';
import { memoryDb, notify } from '@/lib/db/memory';
import { db } from '@/lib/db/persistence';
import { gradeCard } from '@/lib/review';
import { getSeqNo, setSeqNo } from '@/lib/sync/meta';
import { CardWithMetadata } from '@/lib/types';
import { createEmptyCard, Grade } from 'ts-fsrs';
import { z } from 'zod';

export const states = ['New', 'Learning', 'Review', 'Relearning'] as const;

const defaultCard: Omit<CardWithMetadata, 'id'> = {
  ...createEmptyCard(),
  front: '',
  back: '',
  deleted: false,

  // CRDT metadata
  cardLastModified: 0,
  cardContentLastModified: 0,
  cardDeletedLastModified: 0,

  createdAt: 0,
};

export const cardOperationSchema = z
  .object({
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
  })
  .passthrough();

export type CardOperation = z.infer<typeof cardOperationSchema>;

export const cardContentOperationSchema = z
  .object({
    type: z.literal('cardContent'),
    payload: z.object({
      cardId: z.string(),
      front: z.string(),
      back: z.string(),
    }),
    timestamp: z.number(),
  })
  .passthrough();

export type CardContentOperation = z.infer<typeof cardContentOperationSchema>;

export const cardDeletedOperationSchema = z
  .object({
    type: z.literal('cardDeleted'),
    payload: z.object({
      cardId: z.string(),
      deleted: z.boolean(),
    }),
    timestamp: z.number(),
  })
  .passthrough();

export type CardDeletedOperation = z.infer<typeof cardDeletedOperationSchema>;

export const deckOperationSchema = z
  .object({
    type: z.literal('deck'),
    payload: z.object({
      id: z.string(),
      name: z.string(),
      deleted: z.boolean(),
      description: z.string(),
    }),
    timestamp: z.number(),
  })
  .passthrough();

export type DeckOperation = z.infer<typeof deckOperationSchema>;

export const updateDeckCardOperationSchema = z
  .object({
    type: z.literal('updateDeckCard'),
    payload: z.object({
      deckId: z.string(),
      cardId: z.string(),
      clCount: z.number(),
    }),
    timestamp: z.number(),
  })
  .passthrough();

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

export const server2ClientSyncSchema = z.object({
  ops: z.array(
    z.union([
      cardOperationSchema.extend({ seqNo: z.number() }),
      cardContentOperationSchema.extend({ seqNo: z.number() }),
      cardDeletedOperationSchema.extend({ seqNo: z.number() }),
      deckOperationSchema.extend({ seqNo: z.number() }),
      updateDeckCardOperationSchema.extend({ seqNo: z.number() }),
    ])
  ),
});
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

  const cardContentOperation: CardContentOperation = {
    type: 'cardContent',
    payload: {
      cardId: card.id,
      front: card.front,
      back: card.back,
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
export async function createNewCard(front: string, back: string) {
  const card: CardWithMetadata = {
    ...createEmptyCard(),
    id: crypto.randomUUID(),
    front,
    back,

    // CRDT metadata
    cardLastModified: 0,
    cardContentLastModified: 0,
    cardDeletedLastModified: 0,
  };

  const operations = emptyCardToOperations(card);

  for (const operation of operations) {
    const result = handleClientOperation(operation);
    if (!result.applied) {
      throw new Error(
        'SHOULD NOT HAPPEN - there should not be conflict when creating new cards'
      );
    }
  }

  await db.operations.bulkAdd(operations);
  await db.pendingOperations.bulkAdd(operations);
  notify();
}

export async function gradeCardOperation(card: CardWithMetadata, grade: Grade) {
  const { nextCard } = gradeCard(card, grade);

  const cardOperation: CardOperation = {
    type: 'card',
    payload: {
      id: card.id,
      ...nextCard,
      state: STATE_NUMBER_TO_NAME[nextCard.state],
      last_review: nextCard.last_review ?? null,
    },
    timestamp: Date.now(),
  };

  await handleClientOperationWithPersistence(cardOperation);
}

type OperationResult = {
  applied: boolean;
};

function handleCardOperation(operation: CardOperation): OperationResult {
  const card = memoryDb.cards[operation.payload.id];

  if (!card) {
    memoryDb.cards[operation.payload.id] = {
      ...defaultCard,
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

      createdAt: operation.timestamp,

      // CRDT metadata
      cardLastModified: operation.timestamp,
    };
    return { applied: true };
  }

  if (card.cardLastModified > operation.timestamp) {
    return { applied: false };
  }

  const updatedCard = {
    ...card,

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
  };

  memoryDb.cards[operation.payload.id] = updatedCard;
  return { applied: true };
}

function handleCardContentOperation(
  operation: CardContentOperation
): OperationResult {
  const card = memoryDb.cards[operation.payload.cardId];
  if (!card) {
    memoryDb.cards[operation.payload.cardId] = {
      ...defaultCard,
      id: operation.payload.cardId,
      front: operation.payload.front,
      back: operation.payload.back,

      cardContentLastModified: operation.timestamp,
    };
    return { applied: true };
  }

  if (card.cardContentLastModified > operation.timestamp) {
    return { applied: false };
  }

  const updatedCard = {
    ...card,
    front: operation.payload.front,
    back: operation.payload.back,
    cardContentLastModified: operation.timestamp,
  };

  memoryDb.cards[operation.payload.cardId] = updatedCard;
  return { applied: true };
}

function handleCardDeletedOperation(
  operation: CardDeletedOperation
): OperationResult {
  const card = memoryDb.cards[operation.payload.cardId];

  if (!card) {
    memoryDb.cards[operation.payload.cardId] = {
      ...defaultCard,
      id: operation.payload.cardId,
      deleted: operation.payload.deleted,

      cardDeletedLastModified: operation.timestamp,
    };
    return { applied: true };
  }

  if (card.cardDeletedLastModified > operation.timestamp) {
    return { applied: false };
  }

  const updatedCard = {
    ...card,
    deleted: operation.payload.deleted,
    cardDeletedLastModified: operation.timestamp,
  };

  memoryDb.cards[operation.payload.cardId] = updatedCard;
  return { applied: true };
}

export function handleClientOperation(operation: Operation): OperationResult {
  switch (operation.type) {
    case 'card':
      return handleCardOperation(operation);
    case 'cardContent':
      return handleCardContentOperation(operation);
    case 'cardDeleted':
      return handleCardDeletedOperation(operation);
    // TODO: add other operations
    case 'deck':
      return { applied: false };
    case 'updateDeckCard':
      return { applied: false };
    default:
      throw new Error(`Unknown operation type: ${JSON.stringify(operation)}`);
  }
}

export async function handleClientOperationWithPersistence(
  operation: Operation
): Promise<OperationResult> {
  const result = handleClientOperation(operation);

  if (result.applied) {
    await db.operations.add(operation);
    await db.pendingOperations.add(operation);
    notify();
  }

  return result;
}

export async function updateDeletedClientSide(
  cardId: string,
  deleted: boolean
) {
  const card = memoryDb.cards[cardId];
  if (!card) {
    return;
  }

  const cardOperation: CardDeletedOperation = {
    type: 'cardDeleted',
    payload: {
      cardId,
      deleted,
    },
    timestamp: Date.now(),
  };
  handleClientOperationWithPersistence(cardOperation);
}

// We assume that the updates are being applied sequentially
// in order of seqNo (which is provided by the server)
// If this guarantee is violated, then we might miss out on some operations applied
// If the updates are applied sequentially, we can just update the sequence number
// whenever an operation succeeds in being applied
export async function applyServerOperations(
  operations: Server2Client<Operation>[]
) {
  const seqNo = await getSeqNo();
  const highestSeqNo = operations.reduce((max, operation) => {
    return Math.max(max, operation.seqNo);
  }, 0);

  if (seqNo >= highestSeqNo) {
    return;
  }

  const operationsApplied = operations
    .filter((op) => op.seqNo > seqNo)
    .map((op) => {
      const result = handleClientOperation(op);
      if (result.applied) {
        return op;
      }
      return null;
    })
    .filter((op) => op !== null);

  notify();

  await setSeqNo(highestSeqNo);
  await db.operations.bulkAdd(operationsApplied);
}
