import { Card } from 'ts-fsrs';

export type CardWithMetadata = Card & {
  id: string;
  question: string;
  answer: string;

  deleted: boolean;

  // CRDT metadata
  cardLastModified: number;
  cardContentLastModified: number;
  cardDeletedLastModified: number;

  created_at: number;
};
