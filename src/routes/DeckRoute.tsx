import CardsTable from '@/components/cards-table';
import { useCardsForDeck, useDeck } from '@/components/hooks/query';
import { Separator } from '@radix-ui/react-dropdown-menu';
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
    <div className='col-start-1 col-end-13 xl:col-start-3 xl:col-end-11 md:px-4'>
      <div className='mb-4 mt-2'>
        <h1 className='text-4xl md:text-4xl'>{deck.name}</h1>
        <p className='text-sm text-muted-foreground'>{deck.description}</p>
      </div>
      <Separator className='my-4' />
      <CardsTable cards={cards} />
    </div>
  );
}
