import CardsTable from '@/components/cards-table';
import { useCardsForDeck, useDeck } from '@/components/hooks/query';
import SearchBar from '@/components/search-bar';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';
import { useParams } from 'react-router';

export default function DeckRoute() {
  const params = useParams();
  const deckId = params.deckId as string;

  const deck = useDeck(deckId);
  const cards = useCardsForDeck(deckId);
  const [search, setSearch] = useState('');
  const filteredCards = cards.filter((card) =>
    (card.front.toLowerCase() + card.back.toLowerCase()).includes(
      search.toLowerCase()
    )
  );

  if (!deck) {
    return <div>Deck not found</div>;
  }

  return (
    <div className='md:px-24 col-span-12'>
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder='Search cards...'
      />
      <div className='mb-4'>
        <h1 className='text-4xl md:text-4xl'>{deck.name}</h1>
        <p className='text-sm text-muted-foreground'>{deck.description}</p>
      </div>
      <Separator className='my-4' />
      <CardsTable cards={filteredCards} />
    </div>
  );
}
