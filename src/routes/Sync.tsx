import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import {
  applyServerOperations,
  Operation,
  Server2Client,
} from '@/lib/operation';
import { setClientId, useClientId } from '@/lib/sync/meta';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SyncRoute() {
  const operations = useLiveQuery(() => db.operations.orderBy('id').toArray());
  const cards = useLiveQuery(() => db.cards.toArray());
  const clientId = useClientId();
  const [seqNo, setSeqNo] = useState(0);

  const [impersonateClientId, setImpersonateClientId] = useState<string | null>(
    null
  );
  useEffect(() => {
    setImpersonateClientId(clientId);
  }, [clientId]);

  const pullFromServer = async () => {
    if (!clientId) {
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/sync?seqNo=${seqNo}`,
      {
        credentials: 'include',
        headers: {
          'X-Client-Id': clientId,
        },
        method: 'GET',
      }
    );
    const data = await response.json();
    const operations = data.ops as Server2Client<Operation>[];
    await applyServerOperations(operations);
    console.log('applied', operations.length, 'operations');
  };

  const pushToServer = async () => {
    if (!clientId) {
      return;
    }

    console.log(
      'sending payload',
      JSON.stringify(
        {
          ops: operations,
        },
        null,
        2
      )
    );
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sync`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'X-Client-Id': clientId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ops: operations,
      }),
    });

    const data = (await response.json()) as { success: boolean };
    console.log(data);

    if (data.success) {
      db.operations.clear();
    }
  };

  const registerClient = async () => {
    if (clientId) return;

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/clientId`,
      {
        credentials: 'include',
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to register client');
    }

    const data: { clientId: string } = await response.json();
    setClientId(data.clientId);
  };

  return (
    <div className='flex flex-col items-start justify-start h-screen gap-12 px-16 py-12'>
      <section className='flex flex-col gap-2'>
        <h1 className='text-2xl font-bold mb-4'>Sync</h1>
        <Button variant='outline' onClick={pullFromServer} disabled={!clientId}>
          <ArrowDownIcon className='w-4 h-4 mr-2' />
          <span>Pull from server</span>
        </Button>

        <Input
          type='number'
          value={seqNo}
          onChange={(e) => setSeqNo(Number(e.target.value))}
        />

        <Input
          type='text'
          value={impersonateClientId ?? ''}
          onChange={(e) => setImpersonateClientId(e.target.value)}
        />
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>Register client</h2>
        <Button variant='outline' onClick={registerClient}>
          <ArrowUpIcon className='w-4 h-4 mr-2' />
          <span>Register client</span>
        </Button>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>Pending Operations</h2>
        <Button
          variant='outline'
          onClick={pushToServer}
          className='mb-4'
          disabled={!clientId}
        >
          <ArrowUpIcon className='w-4 h-4 mr-2' />
          <span>Push to server</span>
        </Button>
        <ul>
          {operations?.map((operation) => (
            <li key={operation.id}>
              {operation.id}: {operation.type} - {operation.timestamp}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>Cards</h2>
        <ul>
          {cards?.map((card) => (
            <li key={card.id}>
              {card.id} - {card.question} - {card.answer} -{' '}
              {/* {card.due.toISOString()} */}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
