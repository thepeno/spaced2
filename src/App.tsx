import { db } from './lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

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
      <button
        onClick={() => {
          db.friends.add({ name: 'Alice', age: 21 });
        }}
      >
        Add another friend
      </button>
    </>
  );
}

export default App;
