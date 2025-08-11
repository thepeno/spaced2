import { OperationWithId } from '@/lib/sync/operation';
import { Dexie, type EntityTable } from 'dexie';

export const db = new Dexie('SpacedDatabase') as Dexie & {
  operations: EntityTable<OperationWithId, '_id'>;
  // Store review logs in a separate table
  // as they are separate from the card-related logic and we can
  // save on startup time by not loading them from memory
  reviewLogOperations: EntityTable<OperationWithId, '_id'>;
  pendingOperations: EntityTable<OperationWithId, '_id'>;
  metadataKv: EntityTable<{ key: string; value: unknown }, 'key'>;
};

db.version(1).stores({
  operations: '++_id, timestamp',
  reviewLogOperations: '++_id, timestamp',
  pendingOperations: '++_id, timestamp',
  metadataKv: 'key, value',
});

// Version 2: Add support for deck languages and card example sentences
// No actual schema changes needed since we use operation-based sync
db.version(2).stores({
  operations: '++_id, timestamp',
  reviewLogOperations: '++_id, timestamp',
  pendingOperations: '++_id, timestamp',
  metadataKv: 'key, value',
});

// Database initialization with error handling
export async function initializeDatabase() {
  try {
    await db.open();
    console.log('Database opened successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    
    // Handle various database corruption scenarios
    if (error instanceof Error) {
      const isCorrupted = 
        error.name === 'DatabaseClosedError' || 
        error.name === 'UnknownError' || 
        error.message.includes('backing store') ||
        error.message.includes('Internal error') ||
        error.message.includes('UnknownError');
        
      if (isCorrupted) {
        console.warn('Database corrupted, attempting recovery...');
        
        // Try multiple recovery strategies
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            console.log(`Recovery attempt ${attempt + 1}/3`);
            
            // Close any existing connections
            if (db.isOpen()) {
              db.close();
            }
            
            // Delete the corrupted database
            await db.delete();
            console.log('Corrupted database deleted');
            
            // Wait a bit before recreating
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Try to open fresh database
            await db.open();
            console.log('Database recreated successfully');
            return true;
            
          } catch (recoveryError) {
            console.error(`Recovery attempt ${attempt + 1} failed:`, recoveryError);
            if (attempt === 2) {
              // Last attempt failed, show user message
              console.error('All recovery attempts failed');
              if (typeof window !== 'undefined') {
                alert('Database corruption detected. Please:\n\n1. Open Developer Tools (F12)\n2. Go to Application tab\n3. Find IndexedDB → SpacedDatabase\n4. Delete the database\n5. Refresh the page');
              }
              return false;
            }
            // Wait longer between attempts
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
    }
    return false;
  }
}

// Utility function to manually clear the database
export async function clearDatabase() {
  try {
    if (db.isOpen()) {
      db.close();
    }
    await db.delete();
    console.log('Database cleared successfully. Refresh the page to recreate.');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    return true;
  } catch (error) {
    console.error('Failed to clear database:', error);
    return false;
  }
}

// Nuclear option: clear all site storage
export async function nuclearClearStorage() {
  if (typeof window !== 'undefined') {
    try {
      // Clear all possible storage types
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear IndexedDB databases
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            return new Promise<void>((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name!);
              deleteReq.onerror = () => reject(deleteReq.error);
              deleteReq.onsuccess = () => resolve();
            });
          })
        );
      }
      
      console.log('All storage cleared. Reloading page...');
      window.location.reload();
      return true;
    } catch (error) {
      console.error('Nuclear clear failed:', error);
      alert('Please manually clear browser data:\n\n1. Open DevTools (F12)\n2. Application tab\n3. Storage → Clear site data\n4. Refresh page');
      return false;
    }
  }
  return false;
}

// Make both functions available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).clearSpacedDatabase = clearDatabase;
  (window as any).nuclearClearStorage = nuclearClearStorage;
}
