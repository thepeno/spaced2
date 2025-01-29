import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { applyServerOperations } from '@/lib/sync/operation';
import { setClientId, useClientId } from '@/lib/sync/meta';
import { pullFromServer, pushToServer } from '@/lib/sync/server';
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

  const syncFromServer = async () => {
    if (!clientId) {
      return;
    }

    const operations = await pullFromServer(clientId, seqNo);
    await applyServerOperations(operations);
    console.log('applied', operations.length, 'operations');
  };

  const syncToServer = async () => {
    if (!clientId || !operations) {
      return;
    }

    const response = await pushToServer(clientId, operations);
    if (response.success) {
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
        <Button variant='outline' onClick={syncFromServer} disabled={!clientId}>
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
          onClick={syncToServer}
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
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
