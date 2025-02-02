import CardsTable from '@/components/cards-table';
import { useCards } from '@/components/hooks/query';
import ReturnToTop from '@/components/return-to-top';
import SearchBar from '@/components/search-bar';
import { useState } from 'react';

export default function BookmarksRoute() {
  const cards = useCards();
  const [search, setSearch] = useState('');

  const bookmarks = cards.filter((card) => card.bookmarked);
  const filteredCards = bookmarks.filter((card) =>
    (card.front.toLowerCase() + card.back.toLowerCase()).includes(
      search.toLowerCase()
    )
  );

  return (
    <div className='md:px-24 xl:px-0 col-span-12 xl:col-start-3 xl:col-end-11'>
      <ReturnToTop />
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder='Search bookmarks...'
      />
      <CardsTable cards={filteredCards} />
    </div>
  );
}
