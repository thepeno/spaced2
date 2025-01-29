import { Operation, operationSchema, Server2Client } from '@/lib/sync/operation';
import { z } from 'zod';

/**
 * Pull operations from the server.
 */
export async function pullFromServer(
  clientId: string,
  seqNo: number
): Promise<Server2Client<Operation>[]> {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/sync?seqNo=${seqNo}`,
    {
      credentials: 'include',
      headers: {
        'X-Client-Id': clientId,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to pull operations from server');
  }

  const data = await response.json();

  // Necessary to coerce the date strings in Card payloads to Date objects
  const parsedData = z
    .object({
      ops: z.array(operationSchema),
    })
    .parse(data);
  const operations = parsedData.ops as Server2Client<Operation>[];

  return operations;
}

/**
 * Push operations to the server.
 */
export async function pushToServer(
  clientId: string,
  operations: Operation[]
): Promise<{ success: boolean }> {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sync`, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'X-Client-Id': clientId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ops: operations }),
  });

  if (!response.ok) {
    throw new Error('Failed to push operations to server');
  }

  const data = await response.json();
  const parsedData = z
    .object({
      success: z.boolean(),
    })
    .parse(data);

  return parsedData;
}
