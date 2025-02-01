import CardsTable from '@/components/cards-table';
import { useCardsForDeck, useDeck } from '@/components/hooks/query';
import { useParams } from 'react-router';

export default function DeckRoute() {
  const params = useParams();
  const deckId = params.deckId as string;

  const deck = useDeck(deckId);
  const cards = useCardsForDeck(deckId);

  if (!deck) {
    return <div>Deck not found</div>;
  }

  return (
    <div>
      <h1>{deck.name}</h1>
      <p>{deck.description}</p>
      <CardsTable cards={cards} />
    </div>
  );
}
