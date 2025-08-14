import CardsTable from '@/components/cards-table';
import { useCards } from '@/components/hooks/query';
import ReturnToTop from '@/components/return-to-top';
import SearchBar from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function AllCardsRoute() {
  const navigate = useNavigate();
  const cards = useCards();
  const [search, setSearch] = useState('');
  const filteredCards = cards.filter((card) =>
    (card.front.toLowerCase() + card.back.toLowerCase()).includes(
      search.toLowerCase()
    )
  );

  return (
    <div className='grow md:px-24 xl:px-0 col-span-12 xl:col-start-3 xl:col-end-11 h-full flex flex-col'>
      <ReturnToTop />

      {/* Back to decks button */}
      <div className="flex mb-4 justify-center">
        <Button
          variant="ghost"
          className="text-primary hover:text-primary/80 hover:bg-transparent p-2"
          onClick={() => navigate('/decks')}
        >
          Back to decks
        </Button>
      </div>

      {/* Cards table with pagination - takes remaining height */}
      <div className='flex flex-col h-full grow mb-4'>
        <CardsTable cards={filteredCards} />
      </div>

      {/* Search bar at bottom */}
      <div className='mb-2'>
        <SearchBar
          search={search}
          setSearch={setSearch}
          placeholder='Search cards...'
        />
      </div>
    </div>
  );
}
