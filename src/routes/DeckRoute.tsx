import CardsTable from '@/components/cards-table';
import { useCardsForDeck, useDeck } from '@/components/hooks/query';
import ReturnToTop from '@/components/return-to-top';
import SearchBar from '@/components/search-bar';
import EditDeckModal from '@/components/edit-deck-modal';
import { Button } from '@/components/ui/button';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Edit } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';

export default function DeckRoute() {
  const params = useParams();
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
    <div className='md:px-24 xl:px-0 col-span-12 xl:col-start-3 xl:col-end-11'>
      <ReturnToTop />
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder='Search cards...'
      />
      <div className='mb-4 px-2'>
        <div className='flex justify-between items-start'>
          <div className='flex-1'>
            <h1 className='text-2xl md:text-4xl font-bold tracking-wide'>
              {deck.name}
            </h1>
            <p className='text-sm text-muted-foreground mb-2'>{deck.description}</p>
            {(deck.nativeLanguage || deck.targetLanguage) && (
              <div className='flex gap-4 text-xs text-muted-foreground'>
                {deck.nativeLanguage && (
                  <span>Native: {deck.nativeLanguage}</span>
                )}
                {deck.targetLanguage && (
                  <span>Target: {deck.targetLanguage}</span>
                )}
              </div>
            )}
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setEditModalOpen(true)}
            className='ml-4'
          >
            <Edit className='h-4 w-4 mr-2' />
            Edit Deck
          </Button>
        </div>
      </div>
      <Separator className='my-4' />
      <CardsTable cards={filteredCards} />
      <EditDeckModal
        deck={deck}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
}
