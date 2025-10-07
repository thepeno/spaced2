import { STATE_NAME_TO_NUMBER, STATE_NUMBER_TO_NAME } from '@/lib/card-mapping';
import MemoryDB, { UndoGrade } from '@/lib/db/memory';
import { db } from '@/lib/db/persistence';
import { gradeCard, reviewLogToReviewLogOperation } from '@/lib/review/review';
import { defaultCard, defaultDeck } from '@/lib/sync/default';
import { getSeqNo, setSeqNo } from '@/lib/sync/meta';
import { CardWithMetadata, Deck } from '@/lib/types';
import { createEmptyCard, Grade } from 'ts-fsrs';
import { z } from 'zod';

export const states = ['New', 'Learning', 'Review', 'Relearning'] as const;
export const ratings = ['Manual', 'Easy', 'Good', 'Hard', 'Again'] as const;

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

export const reviewLogOperationSchema = z
  .object({
    type: z.literal('reviewLog'),
    payload: z.object({
      id: z.string(),
      cardId: z.string(),

      grade: z.enum(ratings),
      state: z.enum(states),

      due: z.coerce.date(),
      stability: z.number(),
      difficulty: z.number(),
      elapsed_days: z.number(),
      last_elapsed_days: z.number(),
      scheduled_days: z.number(),
      review: z.coerce.date(),
      duration: z.number(),

      createdAt: z.coerce.date(),
    }),
    timestamp: z.number(),
  })
  .passthrough();

export type ReviewLogOperation = z.infer<typeof reviewLogOperationSchema>;

export const reviewLogDeletedOperationSchema = z
  .object({
    type: z.literal('reviewLogDeleted'),
    payload: z.object({
      reviewLogId: z.string(),
      deleted: z.boolean(),
    }),
    timestamp: z.number(),
  })
  .passthrough();

export type ReviewLogDeletedOperation = z.infer<
  typeof reviewLogDeletedOperationSchema
>;

export const cardContentOperationSchema = z
  .object({
    type: z.literal('cardContent'),
    payload: z.object({
      cardId: z.string(),
      front: z.string(),
      back: z.string(),
      isReverse: z.boolean().optional(), // Optional for backward compatibility
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

export const deckLanguagesOperationSchema = z
  .object({
    type: z.literal('deckLanguages'),
    payload: z.object({
      deckId: z.string(),
      nativeLanguage: z.string().nullable(),
      targetLanguage: z.string().nullable(),
    }),
    timestamp: z.number(),
  })
  .passthrough();

export type DeckLanguagesOperation = z.infer<typeof deckLanguagesOperationSchema>;

export const cardExampleSentenceOperationSchema = z
  .object({
    type: z.literal('cardExampleSentence'),
    payload: z.object({
      cardId: z.string(),
      exampleSentence: z.string().nullable(),
      exampleSentenceTranslation: z.string().nullable(),
    }),
    timestamp: z.number(),
  })
  .passthrough();

export type CardExampleSentenceOperation = z.infer<typeof cardExampleSentenceOperationSchema>;

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

export const deckNewCardsPerDayOperationSchema = z
  .object({
    type: z.literal('deckNewCardsPerDay'),
    payload: z.object({
      deckId: z.string(),
      newCardsPerDay: z.number(),
    }),
    timestamp: z.number(),
  })
  .passthrough();

export type DeckNewCardsPerDayOperation = z.infer<typeof deckNewCardsPerDayOperationSchema>;

export const operationSchema = z.union([
  cardOperationSchema,
  cardContentOperationSchema,
  cardDeletedOperationSchema,
  cardBookmarkedOperationSchema,
  cardSuspendedOperationSchema,
  deckOperationSchema,
  deckLanguagesOperationSchema,
  deckNewCardsPerDayOperationSchema,
  cardExampleSentenceOperationSchema,
  updateDeckCardOperationSchema,
  reviewLogOperationSchema,
  reviewLogDeletedOperationSchema,
]);
export type Operation = z.infer<typeof operationSchema>;

/**
 * Auto incrementing id to order the operations when storing it.
 * The IDs are for client side ordering when sending to the server,
 * and will not be used by the server.
 */
export type OperationWithId = Operation & { _id: number };

export const server2ClientSyncSchema = z.object({
  ops: z.array(
    z.union([
      cardOperationSchema.extend({ seqNo: z.number() }),
      cardContentOperationSchema.extend({ seqNo: z.number() }),
      cardDeletedOperationSchema.extend({ seqNo: z.number() }),
      cardBookmarkedOperationSchema.extend({ seqNo: z.number() }),
      cardSuspendedOperationSchema.extend({ seqNo: z.number() }),
      deckOperationSchema.extend({ seqNo: z.number() }),
      deckLanguagesOperationSchema.extend({ seqNo: z.number() }),
      cardExampleSentenceOperationSchema.extend({ seqNo: z.number() }),
      updateDeckCardOperationSchema.extend({ seqNo: z.number() }),
      reviewLogOperationSchema.extend({ seqNo: z.number() }),
      reviewLogDeletedOperationSchema.extend({ seqNo: z.number() }),
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
      isReverse: card.isReverse,
    },
    timestamp: now,
  };

  return [cardOperation, cardContentOperation];
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
  decks: string[] = [],
  exampleSentence?: string | null,
  exampleSentenceTranslation?: string | null,
  shouldPregenerateTTS: boolean = true,
  createReverse: boolean = false,
  isReverse: boolean = false
) {
  const card: CardWithMetadata = {
    ...defaultCard,
    ...createEmptyCard(),
    id: crypto.randomUUID(),
    front,
    back,
    isReverse, // Set the reverse flag

    // CRDT metadata
    cardLastModified: 0,
    cardContentLastModified: 0,
    cardDeletedLastModified: 0,
  };

  const cardOperations = emptyCardToOperations(card);
  const deckOperations = cardDeckOperations(card.id, decks);
  
  // Add example sentence operation if provided
  const exampleSentenceOperations: CardExampleSentenceOperation[] = [];
  if (exampleSentence || exampleSentenceTranslation) {
    exampleSentenceOperations.push({
      type: 'cardExampleSentence',
      payload: {
        cardId: card.id,
        exampleSentence: exampleSentence ?? null,
        exampleSentenceTranslation: exampleSentenceTranslation ?? null,
      },
      timestamp: Date.now(),
    });
  }
  
  const operations = [...cardOperations, ...deckOperations, ...exampleSentenceOperations];

  for (const operation of operations) {
    const result = handleClientOperation(operation);
    if (!result.applied) {
      throw new Error(
        'SHOULD NOT HAPPEN - there should not be conflict when creating new cards'
      );
    }
  }

  const operationsCopy = operations.map((op) => structuredClone(op));
  await db.operations.bulkAdd(operations);
  await db.pendingOperations.bulkAdd(operationsCopy);
  MemoryDB.notify();

  // Pre-generate TTS for the new card if requested
  if (shouldPregenerateTTS && decks.length > 0) {
    // Import dynamically to avoid circular dependencies
    const { pregenerateTTS } = await import('../tts/pregenerate');
    const MemoryDB = (await import('../db/memory')).default;
    
    // Get the first deck's language settings
    const allDecks = MemoryDB.getDecks();
    const firstDeck = allDecks.find(deck => decks.includes(deck.id));
    
    if (firstDeck) {
      // Run TTS pre-generation in background (don't await)
      pregenerateTTS(
        front,
        back,
        firstDeck.targetLanguage,
        firstDeck.nativeLanguage,
        exampleSentence,
        exampleSentenceTranslation,
        isReverse
      ).catch(error => {
        console.warn('TTS pre-generation failed:', error);
      });
    }
  }

  // Create reverse card if requested
  if (createReverse) {
    // Create the reverse card: back becomes front, front becomes back
    await createNewCard(
      back, // front becomes back (native language)
      front, // back becomes front (target language)
      decks,
      exampleSentenceTranslation, // example becomes translation
      exampleSentence, // translation becomes example
      shouldPregenerateTTS,
      false, // Don't create reverse of reverse
      true // Mark as reverse card
    );
  }
}

export async function updateCardContentOperation(
  cardId: string,
  front: string,
  back: string,
  isReverse: boolean = false
) {
  const cardOperation: CardContentOperation = {
    type: 'cardContent',
    payload: {
      cardId,
      front,
      back,
      isReverse,
    },
    timestamp: Date.now(),
  };

  await handleClientOperationWithPersistence(cardOperation);
}

const MAX_DURATION_PER_CARD_MS = 2 * 60 * 1000; // 2 minutes

export async function gradeCardOperation(
  card: CardWithMetadata,
  grade: Grade,
  providedDuration: number = 0
) {
  const { nextCard, reviewLog } = gradeCard(card, grade);
  if (providedDuration > MAX_DURATION_PER_CARD_MS) {
    console.warn(
      `Duration for card ${card.id} was ${providedDuration}ms, clamping to ${MAX_DURATION_PER_CARD_MS}ms`
    );
  }

  const duration = Math.min(providedDuration, MAX_DURATION_PER_CARD_MS);
  const cardOperation: CardOperation = {
    type: 'card',
    payload: {
      id: card.id,
      due: nextCard.due,
      stability: nextCard.stability,
      difficulty: nextCard.difficulty,
      elapsed_days: nextCard.elapsed_days,
      scheduled_days: nextCard.scheduled_days,
      reps: nextCard.reps,
      lapses: nextCard.lapses,
      state: STATE_NUMBER_TO_NAME[nextCard.state],
      last_review: nextCard.last_review ?? null,
    },
    timestamp: Date.now(),
  };

  const reviewLogOperation = reviewLogToReviewLogOperation(
    reviewLog,
    card.id,
    duration
  );
  const cardOperationResult = handleCardOperation(cardOperation);
  if (!cardOperationResult.applied) {
    throw new Error(
      'SHOULD NOT HAPPEN - there should not be conflict when grading cards'
    );
  }

  const undo: UndoGrade = {
    card,
    cardId: card.id,
    reviewLogId: reviewLogOperation.payload.id,
  };
  MemoryDB.pushUndoGrade(undo);

  const operationsCopy = [
    structuredClone(cardOperation),
    structuredClone(reviewLogOperation),
  ];

  await db.operations.add(cardOperation);
  await db.reviewLogOperations.add(reviewLogOperation);
  // On fe-dev, the "add" operation modifies to object
  await db.pendingOperations.bulkAdd(operationsCopy);
  MemoryDB.notify();
}

type UndoGradeResult = {
  applied: boolean;
};

/**
 * "Undoing" a grade is done by
 * 1. Marking the existing review log as deleted
 * 2. Writing the old version of the card
 */
export async function undoGradeCard(): Promise<UndoGradeResult> {
  const undo = MemoryDB.popUndoGrade();
  if (!undo) {
    return { applied: false };
  }

  const card = MemoryDB.getCardById(undo.cardId);
  if (!card) {
    return { applied: false };
  }

  const now = Date.now();
  const reviewLogDeletedOperation: ReviewLogDeletedOperation = {
    type: 'reviewLogDeleted',
    payload: {
      reviewLogId: undo.reviewLogId,
      deleted: true,
    },
    timestamp: now,
  };

  const cardOperation: CardOperation = {
    type: 'card',
    payload: {
      id: undo.cardId,
      due: undo.card.due,
      stability: undo.card.stability,
      difficulty: undo.card.difficulty,
      elapsed_days: undo.card.elapsed_days,
      scheduled_days: undo.card.scheduled_days,
      reps: undo.card.reps,
      lapses: undo.card.lapses,
      state: STATE_NUMBER_TO_NAME[undo.card.state],
      last_review: undo.card.last_review ?? null,
    },
    timestamp: now,
  };

  const cardOperationResult = handleCardOperation(cardOperation);
  if (!cardOperationResult.applied) {
    throw new Error(
      'SHOULD NOT HAPPEN - there should not be conflict when undoing card grading'
    );
  }

  const operations = [
    structuredClone(cardOperation),
    structuredClone(reviewLogDeletedOperation),
  ];

  await db.operations.add(cardOperation);
  await db.reviewLogOperations.add(reviewLogDeletedOperation);
  await db.pendingOperations.bulkAdd(operations);
  MemoryDB.notify();

  return { applied: true };
}

export async function createNewDeck(
  name: string, 
  description: string,
  nativeLanguage?: string | null,
  targetLanguage?: string | null
): Promise<string> {
  const deckId = crypto.randomUUID();
  const now = Date.now();
  
  const deckOperation: DeckOperation = {
    type: 'deck',
    payload: {
      id: deckId,
      name,
      description,
      deleted: false,
    },
    timestamp: now,
  };

  const operations: Operation[] = [deckOperation];

  // Add languages operation if languages are provided
  if (nativeLanguage != null || targetLanguage != null) {
    const languagesOperation: DeckLanguagesOperation = {
      type: 'deckLanguages',
      payload: {
        deckId,
        nativeLanguage: nativeLanguage ?? null,
        targetLanguage: targetLanguage ?? null,
      },
      timestamp: now,
    };
    operations.push(languagesOperation);
  }

  // Apply all operations
  for (const operation of operations) {
    const result = handleClientOperation(operation);
    if (!result.applied) {
      throw new Error(
        'SHOULD NOT HAPPEN - there should not be conflict when creating new decks'
      );
    }
  }

  const operationsCopy = operations.map((op) => structuredClone(op));
  await db.operations.bulkAdd(operations);
  await db.pendingOperations.bulkAdd(operationsCopy);
  MemoryDB.notify();
  
  return deckId;
}

export async function updateDeckOperation(
  deckId: string,
  name: string,
  description: string
) {
  const deckOperation: DeckOperation = {
    type: 'deck',
    payload: {
      id: deckId,
      name,
      description,
      deleted: false,
    },
    timestamp: Date.now(),
  };

  await handleClientOperationWithPersistence(deckOperation);
}

export async function deleteDeckOperation(deckId: string) {
  const deck = MemoryDB.getDeckById(deckId);
  if (!deck) return;
  
  const deckOperation: DeckOperation = {
    type: 'deck',
    payload: {
      id: deckId,
      name: deck.name,
      description: deck.description,
      deleted: true,
    },
    timestamp: Date.now(),
  };
  await handleClientOperationWithPersistence(deckOperation);
}

export async function updateDeckLanguagesOperation(
  deckId: string,
  nativeLanguage?: string | null,
  targetLanguage?: string | null
) {
  const languagesOperation: DeckLanguagesOperation = {
    type: 'deckLanguages',
    payload: {
      deckId,
      nativeLanguage: nativeLanguage ?? null,
      targetLanguage: targetLanguage ?? null,
    },
    timestamp: Date.now(),
  };

  await handleClientOperationWithPersistence(languagesOperation);
}

export async function updateDeckNewCardsPerDayOperation(
  deckId: string,
  newCardsPerDay: number
) {
  const newCardsPerDayOperation: DeckNewCardsPerDayOperation = {
    type: 'deckNewCardsPerDay',
    payload: {
      deckId,
      newCardsPerDay,
    },
    timestamp: Date.now(),
  };
  await handleClientOperationWithPersistence(newCardsPerDayOperation);
}

export async function updateCardExampleSentenceOperation(
  cardId: string,
  exampleSentence?: string | null,
  exampleSentenceTranslation?: string | null
) {
  const exampleSentenceOperation: CardExampleSentenceOperation = {
    type: 'cardExampleSentence',
    payload: {
      cardId,
      exampleSentence: exampleSentence ?? null,
      exampleSentenceTranslation: exampleSentenceTranslation ?? null,
    },
    timestamp: Date.now(),
  };

  await handleClientOperationWithPersistence(exampleSentenceOperation);
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
      isReverse: operation.payload.isReverse ?? false, // Default to false for backward compatibility

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
    isReverse: operation.payload.isReverse ?? false, // Default to false for backward compatibility
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
    return { applied: true };
  }

  const existingClCount = cardsMap[operation.payload.cardId];

  if (operation.payload.clCount <= existingClCount) {
    return { applied: false };
  }

  cardsMap[operation.payload.cardId] = operation.payload.clCount;
  return { applied: true };
}

function handleDeckLanguagesOperation(
  operation: DeckLanguagesOperation
): OperationResult {
  const deck = MemoryDB.getDeckById(operation.payload.deckId);

  if (!deck) {
    MemoryDB.putDeck({
      ...defaultDeck,
      id: operation.payload.deckId,
      nativeLanguage: operation.payload.nativeLanguage,
      targetLanguage: operation.payload.targetLanguage,
      languagesLastModified: operation.timestamp,
    });
    return { applied: true };
  }

  if (deck.languagesLastModified > operation.timestamp) {
    return { applied: false };
  }

  const updatedDeck: Deck = {
    ...deck,
    nativeLanguage: operation.payload.nativeLanguage,
    targetLanguage: operation.payload.targetLanguage,
    languagesLastModified: operation.timestamp,
  };
  MemoryDB.putDeck(updatedDeck);
  return { applied: true };
}

function handleDeckNewCardsPerDayOperation(
  operation: DeckNewCardsPerDayOperation
): OperationResult {
  const deck = MemoryDB.getDeckById(operation.payload.deckId);

  if (!deck) {
    MemoryDB.putDeck({
      ...defaultDeck,
      id: operation.payload.deckId,
      newCardsPerDay: operation.payload.newCardsPerDay,
      newCardsPerDayLastModified: operation.timestamp,
    });
    return { applied: true };
  }

  if (deck.newCardsPerDayLastModified > operation.timestamp) {
    return { applied: false };
  }

  const updatedDeck: Deck = {
    ...deck,
    newCardsPerDay: operation.payload.newCardsPerDay,
    newCardsPerDayLastModified: operation.timestamp,
  };
  MemoryDB.putDeck(updatedDeck);
  return { applied: true };
}

function handleCardExampleSentenceOperation(
  operation: CardExampleSentenceOperation
): OperationResult {
  const card = MemoryDB.getCardById(operation.payload.cardId);

  if (!card) {
    MemoryDB.putCard({
      ...defaultCard,
      id: operation.payload.cardId,
      exampleSentence: operation.payload.exampleSentence,
      exampleSentenceTranslation: operation.payload.exampleSentenceTranslation,
      cardExampleSentenceLastModified: operation.timestamp,
    });
    return { applied: true };
  }

  if (card.cardExampleSentenceLastModified > operation.timestamp) {
    return { applied: false };
  }

  const updatedCard: CardWithMetadata = {
    ...card,
    exampleSentence: operation.payload.exampleSentence,
    exampleSentenceTranslation: operation.payload.exampleSentenceTranslation,
    cardExampleSentenceLastModified: operation.timestamp,
  };
  MemoryDB.putCard(updatedCard);
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
    case 'deckLanguages':
      return handleDeckLanguagesOperation(operation);
    case 'deckNewCardsPerDay':
      return handleDeckNewCardsPerDayOperation(operation);
    case 'cardExampleSentence':
      return handleCardExampleSentenceOperation(operation);
    case 'updateDeckCard':
      return handleUpdateDeckCardOperation(operation);
    case 'reviewLog':
      return { applied: false };
    case 'reviewLogDeleted':
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
    const operationCopy = structuredClone(operation);
    await db.operations.add(operation);
    await db.pendingOperations.add(operationCopy);
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

export async function applyOperations(operations: Operation[]) {
  const appliedOperations: Operation[] = [];
  for (const operation of operations) {
    const result = handleClientOperation(operation);
    if (result.applied) {
      appliedOperations.push(operation);
    }
  }

  const reviewLogOperations = operations.filter(
    (op) => op.type === 'reviewLog' || op.type === 'reviewLogDeleted'
  );

  const operationsCopy = [...appliedOperations, ...reviewLogOperations].map(
    (op) => structuredClone(op)
  );

  await db.operations.bulkAdd(appliedOperations);
  await db.reviewLogOperations.bulkAdd(reviewLogOperations);
  await db.pendingOperations.bulkAdd(operationsCopy);
  MemoryDB.notify();
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
  const reviewLogOperations = operations.filter(
    (op) => op.type === 'reviewLog' || op.type === 'reviewLogDeleted'
  );
  const reviewLogPromise = db.reviewLogOperations.bulkAdd(reviewLogOperations);

  await Promise.all([
    db.operations.bulkAdd(operationsApplied),
    reviewLogPromise,
  ]);
}
