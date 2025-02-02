import { CreateFlashcardForm } from '@/components/create-flashcard';
import { useDecks } from '@/components/hooks/query';
import SearchBar from '@/components/search-bar';
import { Card } from '@/components/ui/card';
import { createNewCard } from '@/lib/sync/operation';
import { cn } from '@/lib/utils';
import { CircleCheck } from 'lucide-react';
import { useState } from 'react';

export function DeckSelectionCard({
  title,
  backgroundType,
  onSelect,
  selected,
}: {
  title: string;
  backgroundType: 'cool-mint' | 'cyan' | 'plate-armor' | 'plain';
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <div>
      <Card
        className={cn(
          'h-40 w-32 relative cursor-pointer border-3 border-background',
          'hover:scale-105 transition-all duration-300',
          backgroundType === 'cool-mint'
            ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
            : backgroundType === 'cyan'
            ? 'bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-400'
            : backgroundType === 'plate-armor'
            ? 'bg-gradient-to-br from-gray-300 via-gray-500 to-gray-700'
            : 'bg-muted-foreground',
        )}
        onClick={onSelect}
      >
        <div className='absolute top-2 left-2'>
          <CircleCheck
            className={cn(
              selected ? 'text-white' : 'text-transparent',
              'h-6 w-6',
              selected && 'animate-scale'
            )}
          />
        </div>
        <h2 className='absolute bottom-4 right-3 text-white text-md font-semibold max-w-24 text-right'>
          {title}
        </h2>
      </Card>
    </div>
  );
}

export default function CreateFlashcardRoute() {
  const [search, setSearch] = useState('');

  const decks = useDecks();
  const shownDecks = decks.filter((deck) =>
    (deck.name.toLowerCase() + deck.description.toLowerCase()).includes(
      search.trim().toLowerCase()
    )
  );
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);

  return (
    <div className='col-span-12 xl:col-start-4 xl:col-end-10 md:px-24 xl:px-0 h-full animate-fade-in'>
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder='Filter decks...'
        onEnter={() => {
          const selectedDeck = shownDecks[0];
          if (!selectedDeck) {
            return;
          }

          const isSelected = selectedDecks.includes(selectedDeck.id);
          if (isSelected) {
            setSelectedDecks(
              selectedDecks.filter((id) => id !== selectedDeck.id)
            );
          } else {
            setSelectedDecks([...selectedDecks, selectedDeck.id]);
          }
        }}
      />

      <div className='flex gap-4 overflow-x-scroll mb-2 bg-background p-4 rounded-xl'>
        {shownDecks.map((deck) => {
          const selected = selectedDecks.includes(deck.id);
          return (
            <DeckSelectionCard
              key={deck.id}
              title={deck.name}
              backgroundType={selected ? 'cool-mint' : 'plain'}
              selected={selected}
              onSelect={() => {
                if (selected) {
                  setSelectedDecks(
                    selectedDecks.filter((id) => id !== deck.id)
                  );
                } else {
                  setSelectedDecks([...selectedDecks, deck.id]);
                }
              }}
            />
          );
        })}
      </div>

      <CreateFlashcardForm
        onSubmit={async (values) => {
          await createNewCard(values.front, values.back, selectedDecks);
        }}
      />
    </div>
  );
}
