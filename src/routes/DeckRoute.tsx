import CardsTable from '@/components/cards-table';
import { useCardsForDeck, useDeck } from '@/components/hooks/query';
import ReturnToTop from '@/components/return-to-top';
import SearchBar from '@/components/search-bar';
import EditDeckModal from '@/components/edit-deck-modal';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';

export default function DeckRoute() {
  const params = useParams();
  const navigate = useNavigate();
  const deckId = params.deckId as string;

  const deck = useDeck(deckId);
  const cards = useCardsForDeck(deckId);
  const [search, setSearch] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const filteredCards = cards.filter((card) =>
    (card.front.toLowerCase() + card.back.toLowerCase()).includes(
      search.toLowerCase()
    )
  );

  if (!deck) {
    return <div>Deck not found</div>;
  }

  return (
    <div className='md:px-24 xl:px-0 col-span-12 xl:col-start-3 xl:col-end-11 h-full flex grow flex-col px-5 pb-2 pt-6'>
      <ReturnToTop />

      {/* Navigation buttons */}
      <div className="flex gap-3 mb-4 justify-center">
        <Button
          variant="ghost"
          className="text-primary hover:text-primary/80 hover:bg-transparent p-2"
          onClick={() => navigate('/decks')}
        >
          All decks
        </Button>
        <Button
          variant="ghost"
          className="text-primary hover:text-primary/80 hover:bg-transparent p-2"
          onClick={() => navigate(`/?deck=${deckId}`)}
        >
          Add
        </Button>
        <Button
          variant="ghost"
          className="text-primary hover:text-primary/80 hover:bg-transparent p-2"
          onClick={() => setEditModalOpen(true)}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          className="text-primary hover:text-primary/80 hover:bg-transparent p-2"
          onClick={() => navigate(`/decks/${deckId}/review`)}
        >
          Review
        </Button>
      </div>

      {/* Cards table with pagination - takes remaining height */}
      <div className='flex flex-col grow h-full mb-4'>
        <CardsTable
          cards={filteredCards}
          targetLanguage={deck.targetLanguage}
          nativeLanguage={deck.nativeLanguage}
        />
      </div>

      {/* Search bar at bottom */}
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder='Search cards...'
      />

      <EditDeckModal
        deck={deck}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
}
