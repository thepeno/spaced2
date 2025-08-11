import { Card } from 'ts-fsrs';

export type CardWithMetadata = Card & {
  id: string;
  front: string;
  back: string;
  exampleSentence: string | null;
  exampleSentenceTranslation: string | null;

  deleted: boolean;
  bookmarked: boolean;
  suspended?: Date;

  // CRDT metadata
  cardLastModified: number;
  cardContentLastModified: number;
  cardDeletedLastModified: number;
  cardBookmarkedLastModified: number;
  cardSuspendedLastModified: number;
  cardExampleSentenceLastModified: number;

  createdAt: number;
};

export type Deck = {
  id: string;
  name: string;
  description: string;
  nativeLanguage: string | null;
  targetLanguage: string | null;
  deleted: boolean;
  lastModified: number;
  languagesLastModified: number;
};
