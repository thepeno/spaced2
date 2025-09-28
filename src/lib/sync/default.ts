import { CardWithMetadata, Deck } from '@/lib/types';
import { createEmptyCard } from 'ts-fsrs';

export const defaultCard: Omit<CardWithMetadata, 'id'> = {
  ...createEmptyCard(),
  front: '',
  back: '',
  exampleSentence: null,
  exampleSentenceTranslation: null,
  deleted: false,

  bookmarked: false,
  isReverse: false, // default to forward card (front=target, back=native)

  // CRDT metadata
  cardLastModified: 0,
  cardContentLastModified: 0,
  cardDeletedLastModified: 0,
  cardBookmarkedLastModified: 0,
  cardSuspendedLastModified: 0,
  cardExampleSentenceLastModified: 0,

  createdAt: 0,
};

export const defaultDeck: Omit<Deck, 'id'> = {
  name: '',
  description: '',
  nativeLanguage: null,
  targetLanguage: null,
  deleted: false,
  lastModified: 0,
  languagesLastModified: 0,
};
