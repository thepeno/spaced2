import { CardWithContent } from '@/lib/types';
import { Dexie, type EntityTable } from 'dexie';

export const db = new Dexie('SpacedDatabase') as Dexie & {
  cards: EntityTable<CardWithContent, 'id'>;
};

db.version(1).stores({
  cards: 'id, due, state',
});
