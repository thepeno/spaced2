import { Dexie, type EntityTable } from 'dexie';

// Typing for your entities (hint is to move this to its own module)
export interface Friend {
  id: number;
  name: string;
  age: number;
}

// Database declaration (move this to its own module also)
export const db = new Dexie('FriendDatabase') as Dexie & {
  friends: EntityTable<Friend, 'id'>;
};
db.version(1).stores({
  friends: '++id, age',
});
