import { STATE_NAME_TO_NUMBER, STATE_NUMBER_TO_NAME } from '@/lib/card-mapping';
import MemoryDB from '@/lib/db/memory';
import { db } from '@/lib/db/persistence';
import { gradeCard } from '@/lib/review';
import { defaultCard, defaultDeck } from '@/lib/sync/default';
import { getSeqNo, setSeqNo } from '@/lib/sync/meta';
import { CardWithMetadata, Deck } from '@/lib/types';
import { createEmptyCard, Grade } from 'ts-fsrs';
import { z } from 'zod';

export const states = ['New', 'Learning', 'Review', 'Relearning'] as const;

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

export const cardBookmarkedOperationSchema = z
  .object({
    type: z.literal('cardBookmarked'),
    payload: z.object({
      cardId: z.string(),
      bookmarked: z.boolean(),
    }),
    timestamp: z.number(),
  })
  .passthrough();

export type CardBookmarkedOperation = z.infer<
  typeof cardBookmarkedOperationSchema
>;

export const cardSuspendedOperationSchema = z
  .object({
    type: z.literal('cardSuspended'),
    payload: z.object({
      cardId: z.string(),
      suspended: z.coerce.date(),
    }),
    timestamp: z.number(),
  })
  .passthrough();

export type CardSuspendedOperation = z.infer<
  typeof cardSuspendedOperationSchema
>;

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
  cardBookmarkedOperationSchema,
  cardSuspendedOperationSchema,
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
      cardBookmarkedOperationSchema.extend({ seqNo: z.number() }),
      cardSuspendedOperationSchema.extend({ seqNo: z.number() }),
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

function cardDeckOperations(
  cardId: string,
  decks: string[]
): UpdateDeckCardOperation[] {
  return decks.map((deckId) => ({
    type: 'updateDeckCard',
    payload: { deckId, cardId, clCount: 1 },
    timestamp: Date.now(),
  }));
}

/**
 * Creates a new card in the database
 *
 * Implementation is to merge the operations (without seqeuence number).
 * Doing so simplifies the implementation of the client side and ensures
 * consistency when updating the database.
 */
export async function createNewCard(
  front: string,
  back: string,
  decks: string[] = []
) {
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

  const cardOperations = emptyCardToOperations(card);
  const deckOperations = cardDeckOperations(card.id, decks);
  const operations = [...cardOperations, ...deckOperations];

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
  MemoryDB.notify();
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
  const card = MemoryDB.getCardById(operation.payload.id);

  if (!card) {
    MemoryDB.putCard({
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
    });
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

  MemoryDB.putCard(updatedCard);
  return { applied: true };
}

function handleCardContentOperation(
  operation: CardContentOperation
): OperationResult {
  const card = MemoryDB.getCardById(operation.payload.cardId);
  if (!card) {
    MemoryDB.putCard({
      ...defaultCard,
      id: operation.payload.cardId,
      front: operation.payload.front,
      back: operation.payload.back,

      cardContentLastModified: operation.timestamp,
    });
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

  MemoryDB.putCard(updatedCard);
  return { applied: true };
}

function handleCardDeletedOperation(
  operation: CardDeletedOperation
): OperationResult {
  const card = MemoryDB.getCardById(operation.payload.cardId);

  if (!card) {
    MemoryDB.putCard({
      ...defaultCard,
      id: operation.payload.cardId,
      deleted: operation.payload.deleted,

      cardDeletedLastModified: operation.timestamp,
    });
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

  MemoryDB.putCard(updatedCard);
  return { applied: true };
}

function handleCardBookmarkedOperation(
  operation: CardBookmarkedOperation
): OperationResult {
  const card = MemoryDB.getCardById(operation.payload.cardId);

  if (!card) {
    MemoryDB.putCard({
      ...defaultCard,
      id: operation.payload.cardId,
      bookmarked: operation.payload.bookmarked,
      cardBookmarkedLastModified: operation.timestamp,
    });
    return { applied: true };
  }

  if (card.cardBookmarkedLastModified > operation.timestamp) {
    return { applied: false };
  }

  const updatedCard = {
    ...card,
    bookmarked: operation.payload.bookmarked,
    cardBookmarkedLastModified: operation.timestamp,
  };

  MemoryDB.putCard(updatedCard);
  return { applied: true };
}

function handleCardSuspendedOperation(
  operation: CardSuspendedOperation
): OperationResult {
  const card = MemoryDB.getCardById(operation.payload.cardId);

  if (!card) {
    MemoryDB.putCard({
      ...defaultCard,
      id: operation.payload.cardId,
      suspended: operation.payload.suspended,
      cardSuspendedLastModified: operation.timestamp,
    });
    return { applied: true };
  }

  if (card.cardSuspendedLastModified > operation.timestamp) {
    return { applied: false };
  }

  const updatedCard = {
    ...card,
    suspended: operation.payload.suspended,
    cardSuspendedLastModified: operation.timestamp,
  };

  MemoryDB.putCard(updatedCard);
  return { applied: true };
}

function handleDeckOperation(operation: DeckOperation): OperationResult {
  const deck = MemoryDB.getDeckById(operation.payload.id);

  if (!deck) {
    MemoryDB.putDeck({
      ...defaultDeck,
      id: operation.payload.id,
      name: operation.payload.name,
      description: operation.payload.description,
      deleted: operation.payload.deleted,
      lastModified: operation.timestamp,
    });
    return { applied: true };
  }

  if (deck.lastModified > operation.timestamp) {
    return { applied: false };
  }

  const updatedDeck: Deck = {
    ...deck,
    name: operation.payload.name,
    description: operation.payload.description,
    deleted: operation.payload.deleted,
    lastModified: operation.timestamp,
  };
  MemoryDB.putDeck(updatedDeck);
  return { applied: true };
}

function handleUpdateDeckCardOperation(
  operation: UpdateDeckCardOperation
): OperationResult {
  const cardsMap = MemoryDB._db.decksToCards[operation.payload.deckId];

  if (!cardsMap) {
    MemoryDB._db.decksToCards[operation.payload.deckId] = {
      [operation.payload.cardId]: operation.payload.clCount,
    };
    return { applied: false };
  }

  const existingClCount = cardsMap[operation.payload.cardId];

  if (operation.payload.clCount <= existingClCount) {
    return { applied: false };
  }

  cardsMap[operation.payload.cardId] = operation.payload.clCount;
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
    case 'cardBookmarked':
      return handleCardBookmarkedOperation(operation);
    case 'cardSuspended':
      return handleCardSuspendedOperation(operation);
    case 'deck':
      return handleDeckOperation(operation);
    case 'updateDeckCard':
      return handleUpdateDeckCardOperation(operation);
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
    MemoryDB.notify();
  }

  return result;
}

export async function updateDeletedClientSide(
  cardId: string,
  deleted: boolean
) {
  const card = MemoryDB.getCardById(cardId);
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

export async function updateSuspendedClientSide(
  cardId: string,
  suspended: Date
) {
  const card = MemoryDB.getCardById(cardId);
  if (!card) {
    return;
  }

  const cardOperation: CardSuspendedOperation = {
    type: 'cardSuspended',
    payload: {
      cardId,
      suspended,
    },
    timestamp: Date.now(),
  };
  handleClientOperationWithPersistence(cardOperation);
}

export async function updateBookmarkedClientSide(
  cardId: string,
  bookmarked: boolean
) {
  const card = MemoryDB.getCardById(cardId);
  if (!card) {
    return;
  }

  const cardOperation: CardBookmarkedOperation = {
    type: 'cardBookmarked',
    payload: {
      cardId,
      bookmarked,
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

  MemoryDB.notify();

  await setSeqNo(highestSeqNo);
  await db.operations.bulkAdd(operationsApplied);
}
