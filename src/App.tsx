import { Button } from '@/components/ui/button';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './lib/db';

function App() {
  const youngFriends = useLiveQuery(() =>
    db.friends.where('age').below(30).toArray()
  );

  return (
    <>
      <h3>My young friends</h3>
      <ul>
        {youngFriends?.map((f) => (
          <li key={f.id}>
            Name: {f.name}, Age: {f.age}
          </li>
        ))}
      </ul>
      <Button
        onClick={() => {
          db.friends.add({ name: 'Alice', age: 21 });
        }}
      >
        Add another friend
      </Button>

      <Button
        onClick={() => {
          db.friends.clear();
        }}
      >
        Delete all friends
      </Button>
    </>
  );
}

export default App;
