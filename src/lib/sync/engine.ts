// Pending operations are persisted to IndexedDB.
// The sync engine is responsible for pushing pending operations to the server
// and for pulling operations from the server.
// It runs in the background and executes periodically.
// For pushing pending operations:
// 1. Executed every X seconds
// 2. Executed when we come online
// 3. Executed when the visibility changes

import { db } from '@/lib/db/persistence';
import { getClientId, getSeqNo } from '@/lib/sync/meta';
import { applyServerOperations } from '@/lib/sync/operation';
import { pullFromServer, pushToServer } from '@/lib/sync/server';

// Note: we don't have to handle race conditions as the operations being sent
// to the server are idempotent.

const MAX_OPERATIONS = 2500;

const SYNC_TO_SERVER_INTERVAL = 10000;
const SYNC_FROM_SERVER_INTERVAL = 30 * 1000 * 5; // Sync from server interval can be long
let started = false;

let syncToServerInProgress = false;
async function syncToServer() {
  if (syncToServerInProgress) {
    return;
  }

  syncToServerInProgress = true;

  try {
    if (!navigator.onLine) {
      return;
    }

    const clientId = await getClientId();
    if (!clientId) {
      return;
    }

    const pendingOperations = await db.pendingOperations.toArray();
    if (pendingOperations.length === 0) {
      return;
    }

    // Process operations in chunks
    for (let i = 0; i < pendingOperations.length; i += MAX_OPERATIONS) {
      const chunk = pendingOperations.slice(i, i + MAX_OPERATIONS);

      console.log('Pushing', chunk.length, 'operations');
      const { success } = await pushToServer(clientId, chunk);

      if (!success) {
        console.error('Failed to push operations to server');
        break;
      }

      // Delete the successfully sent chunk
      await db.pendingOperations.bulkDelete(chunk.map((op) => op._id));
      console.log(
        'Synced',
        Math.min(i + MAX_OPERATIONS, pendingOperations.length),
        'operations',
        'of',
        pendingOperations.length
      );
    }
  } finally {
    syncToServerInProgress = false;
  }
}

let syncFromServerInProgress = false;
let promise: Promise<void> | null = null;

async function syncFromServer() {
  try {
    const clientId = await getClientId();
    if (!clientId) {
      return;
    }

    const seqNo = await getSeqNo();

    const operations = await pullFromServer(clientId, seqNo);
    if (operations.length === 0) {
      return;
    }

    await applyServerOperations(operations);
  } finally {
    syncFromServerInProgress = false;
  }
}

// We sync from server more infrequently as we don't want to overload the server
function syncFromServerCached() {
  if (syncFromServerInProgress) {
    return promise;
  }

  syncFromServerInProgress = true;
  promise = syncFromServer();
}

function start() {
  if (started) {
    return;
  }

  started = true;

  syncToServer();
  syncFromServerCached();

  // Sync to server
  setInterval(syncToServer, SYNC_TO_SERVER_INTERVAL);
  document.addEventListener('visibilitychange', () => {
    // Sync when the user switches away
    if (document.visibilityState === 'hidden') {
      syncToServer();
    }
  });
  document.addEventListener('online', () => {
    syncToServer();
  });

  // Sync from server
  setInterval(syncFromServerCached, SYNC_FROM_SERVER_INTERVAL);
  document.addEventListener('online', () => {
    syncFromServerCached();
  });
  // Grab from serve whenever the user comes back
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncFromServerCached();
    }
  });
}

async function wipeDatabase() {
  syncToServerInProgress = false;
  syncFromServerInProgress = false;
  promise = null;

  await db.delete();
}

const SyncEngine = {
  syncToServer,
  syncFromServer: syncFromServerCached,
  start,
  wipeDatabase,
};

export default SyncEngine;
