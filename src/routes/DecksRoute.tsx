import DeckCardContainer from '@/components/deck/deck-card-container';
import AllCardsButton from '@/components/deck/all-cards-button';
import NewDeckButton from '@/components/deck/new-deck-button';
import { useDecks } from '@/components/hooks/query';
import SearchBar from '@/components/search-bar';
import { useState, useEffect } from 'react';

export default function DecksRoute() {
  const decks = useDecks();
  const [search, setSearch] = useState('');
  const [alwaysShowSearch, setAlwaysShowSearch] = useState(false);

  // Load search override setting
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('settings-always-show-search');
      setAlwaysShowSearch(saved === 'true');
    };

    // Load initial value
    handleStorageChange();

    // Listen for changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event for same-tab updates
    window.addEventListener('settings-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-updated', handleStorageChange);
    };
  }, []);

  const showSearch = alwaysShowSearch || decks.length > 8;

  const filteredDecks = decks.filter((deck) =>
    deck.name.toLowerCase().replace(/-/g, '').includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full justify-end grow px-5 pb-2 pt-6">
      {/* Conditional Search at top */}


      {/* Deck Cards */}
      <div className="flex flex-col gap-2 mb-4 overflow-y-auto">
        {filteredDecks.map((deck) => (
          <DeckCardContainer key={deck.id} id={deck.id} />
        ))}
      </div>

      {/* Action Buttons - aligned to bottom */}
      <div className="grid grid-cols-2 gap-2">
        <AllCardsButton />
        <NewDeckButton />
      </div>

      {showSearch && (
        <div className="mt-4">
          <SearchBar
            search={search}
            setSearch={setSearch}
            placeholder='Search decks...'
          />
        </div>
      )}
    </div>
  );
}
