import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DeckSelectorProps {
  decks: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  value: string;
  onValueChange: (value: string) => void;
  onCreateNew: () => void;
  placeholder?: string;
  className?: string;
}

export function DeckSelector({
  decks,
  value,
  onValueChange,
  onCreateNew,
  placeholder = 'Select a deck...',
  className,
}: DeckSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  const selectedDeck = decks.find((deck) => deck.id === value);

  const filteredDecks = decks.filter((deck) =>
    (deck.name.toLowerCase() + ' ' + deck.description.toLowerCase()).includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // If no decks exist, show a create button instead
  if (decks.length === 0) {
    return (
      <Button
        variant="outline"
        onClick={onCreateNew}
        className={cn('w-full justify-start', className)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create deck
      </Button>
    );
  }

  const handleSelect = (deckId: string) => {
    onValueChange(deckId);
    setOpen(false);
    setSearch('');
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn('w-full justify-between', className)}
        type="button"
        onClick={handleToggle}
      >
        {selectedDeck ? selectedDeck.name : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md"
        >
          <div className="p-2">
            <Input
              placeholder="Search decks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm"
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            <div
              className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground font-medium border-b"
              onClick={() => {
                onCreateNew();
                setOpen(false);
                setSearch('');
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create new deck
            </div>
            
            {filteredDecks.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No deck found.
              </div>
            ) : (
              filteredDecks.map((deck) => (
                <div
                  key={deck.id}
                  className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelect(deck.id)}
                >
                  <div className="flex items-start">
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 mt-0.5 shrink-0',
                        value === deck.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{deck.name}</span>
                      {deck.description && (
                        <span className="text-xs text-muted-foreground">
                          {deck.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}