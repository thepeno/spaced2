import * as React from 'react';
import { Check, CaretDown, Plus } from 'phosphor-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@uidotdev/usehooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const isMobile = useMediaQuery('(max-width: 768px)');

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

  const renderOptions = () => (
    <>
      <div className="p-4 border-b">
        <Input
          placeholder="Search decks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm"
          autoFocus={!isMobile}
        />
      </div>

      <div className={cn("overflow-y-auto", isMobile ? "max-h-[60vh]" : "max-h-60")}>
        <div
          className="flex items-center px-4 py-3 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground font-medium border-b"
          onClick={() => {
            onCreateNew();
            setOpen(false);
            setSearch('');
          }}
        >
          <Plus className="mr-3 h-4 w-4" />
          Create new deck
        </div>

        {filteredDecks.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No deck found.
          </div>
        ) : (
          filteredDecks.map((deck) => (
            <div
              key={deck.id}
              className="px-4 py-3 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleSelect(deck.id)}
            >
              <div className="flex items-start">
                <Check
                  className={cn(
                    'mr-3 h-4 w-4 mt-0.5 shrink-0',
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
    </>
  );

  return (
    <>
      <div className="relative w-full">
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between shadow-none h-15 font-normal rounded-[12px]', className)}
          type="button"
          onClick={handleToggle}
        >
          {selectedDeck ? selectedDeck.name : placeholder}
          <CaretDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {/* Desktop Dropdown */}
        {open && !isMobile && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md"
          >
            {renderOptions()}
          </div>
        )}
      </div>

      {/* Mobile Modal */}
      {isMobile && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="fixed bottom-0 left-0 right-0 top-auto max-w-none w-full rounded-t-xl rounded-b-none border-0 p-0 m-0 translate-x-0 translate-y-0">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle>Select a deck</DialogTitle>
            </DialogHeader>
            {renderOptions()}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}