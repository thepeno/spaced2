import DeckCard from '@/components/deck-card';
import { useDecks } from '@/components/hooks/query';
import SearchBar from '@/components/search-bar';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function DecksRoute() {
  const decks = useDecks();
  const [search, setSearch] = useState('');
  const filteredDecks = decks.filter((deck) =>
    (
      deck.name.toLowerCase().replace(/-/g, '') + deck.description.toLowerCase()
    ).includes(search.toLowerCase())
  );

  return (
    <div
      className={cn(
        'grid grid-cols-12 gap-x-6 xl:items-start items-center',
        'col-start-1 col-end-13',
        'xl:col-start-3 xl:col-end-11 xl:grid-cols-8',
        'h-full grid-rows-[min-content_1fr] px-0 pb-12 sm:px-4 items-start'
      )}
    >
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder='Search decks...'
      />
      <section className='col-span-12 flex flex-wrap gap-x-4 gap-y-4 justify-center items-start min-[900px]:px-24 xl:px-0'>
        {filteredDecks.map((deck) => (
          <DeckCard key={deck.id} id={deck.id} />
        ))}
      </section>
    </div>
  );
}
