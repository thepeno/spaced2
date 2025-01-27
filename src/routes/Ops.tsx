import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export default function OpsRoute() {
  const operations = useLiveQuery(() => db.operations.orderBy('id').toArray());

  console.log(JSON.stringify(operations, null, 2));

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>Operations</h1>
      <ul>
        {operations?.map((operation) => (
          <li key={operation.id}>
            {operation.id}: {operation.type}
          </li>
        ))}
      </ul>
    </div>
  );
}
