import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';

export async function getSeqNo(): Promise<number> {
  const seqNo = await db.metadataKv.get('seqNo');
  if (!seqNo) {
    await db.metadataKv.put({ key: 'seqNo', value: 0 });
    return 0;
  }

  if (typeof seqNo.value !== 'number') {
    throw new Error('seqNo is not a number');
  }

  return seqNo.value as number;
}

export async function setSeqNo(seqNo: number) {
  await db.metadataKv.put({ key: 'seqNo', value: seqNo });
}

export async function setClientId(clientId: string): Promise<void> {
  await db.metadataKv.put({ key: 'clientId', value: clientId });
}

export async function getClientId(): Promise<string | null> {
  const clientId = await db.metadataKv.get('clientId');
  if (!clientId) {
    return null;
  }

  return clientId.value as string;
}

export function useClientId() {
  const clientId = useLiveQuery(() => db.metadataKv.get('clientId'));
  const [clientIdState, setClientIdState] = useState<string | null>(null);

  useEffect(() => {
    setClientIdState(clientId?.value as string);
  }, [clientId]);

  return clientIdState;
}
