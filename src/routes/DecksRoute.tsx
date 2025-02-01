import { useDecks } from '@/components/hooks/query';

export default function DecksRoute() {
  const decks = useDecks();
  return (
    <div>
      <h1>Decks</h1>
      <ul>
        {decks.map((deck) => (
          <li key={deck.id}>{deck.name}</li>
        ))}
      </ul>
    </div>
  );
}
