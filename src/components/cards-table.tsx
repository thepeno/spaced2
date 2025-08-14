import EditFlashcardResponsive from '@/components/card-actions/edit-flashcard-responsive';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CardContentFormValues } from '@/lib/form-schema';
import { updateCardContentOperation, updateCardExampleSentenceOperation } from '@/lib/sync/operation';
import { CardWithMetadata } from '@/lib/types';
import { CaretLeft, CaretRight } from 'phosphor-react';
import { useState, useMemo, useEffect, useRef } from 'react';

const FlashcardTable = ({ cards }: { cards: CardWithMetadata[] }) => {
  const [selectedCard, setSelectedCard] = useState<CardWithMetadata | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const totalPages = Math.ceil(cards.length / cardsPerPage);

  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * cardsPerPage;
    return cards.slice(startIndex, startIndex + cardsPerPage);
  }, [cards, currentPage, cardsPerPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calculate how many cards can fit based on available height
  useEffect(() => {
    const calculateCardsPerPage = () => {
      if (containerRef.current && tableRef.current) {
        const containerHeight = containerRef.current.clientHeight;

        // Get actual measurements from the DOM if possible
        const header = containerRef.current.querySelector('thead') as HTMLElement;
        const pagination = containerRef.current.querySelector('.border-t') as HTMLElement;
        //const firstDataRow = containerRef.current.querySelector('tbody tr:not(.border-0)') as HTMLElement;

        const headerHeight = header?.offsetHeight || 40;
        const paginationHeight = pagination?.offsetHeight || 57;
        const rowHeight = 37;

        // Calculate available space for rows
        const buffer = 4; // Buffer for padding/margins
        const availableHeight = containerHeight - headerHeight - paginationHeight - buffer;
        const maxRows = Math.floor(availableHeight / rowHeight);

        // Set cards per page based on available space
        const newCardsPerPage = Math.max(3, Math.min(maxRows, 20)); // Min 3, max 20

        console.log('Table sizing:', {
          containerHeight,
          headerHeight,
          paginationHeight,
          rowHeight,
          availableHeight,
          maxRows,
          newCardsPerPage
        });

        if (newCardsPerPage !== cardsPerPage) {
          setCardsPerPage(newCardsPerPage);
          setCurrentPage(1); // Reset to first page when changing page size
        }
      }
    };

    // Initial calculation with multiple attempts
    const timeoutId = setTimeout(calculateCardsPerPage, 150);

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(calculateCardsPerPage, 50);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [cardsPerPage]);

  // Reset to first page when cards change
  useEffect(() => {
    setCurrentPage(1);
  }, [cards.length]);

  const handleEdit = (values: CardContentFormValues) => {
    if (!selectedCard) {
      return;
    }
    const hasChanged =
      selectedCard.front !== values.front ||
      selectedCard.back !== values.back ||
      selectedCard.exampleSentence !== (values.exampleSentence || null) ||
      selectedCard.exampleSentenceTranslation !== (values.exampleSentenceTranslation || null);
    if (hasChanged) {
      updateCardContentOperation(selectedCard.id, values.front, values.back);
      // Also update example sentences if they changed
      if ((values.exampleSentence || null) !== selectedCard.exampleSentence ||
        (values.exampleSentenceTranslation || null) !== selectedCard.exampleSentenceTranslation) {
        updateCardExampleSentenceOperation(
          selectedCard.id,
          values.exampleSentence || null,
          values.exampleSentenceTranslation || null
        );
      }
    }
    setSelectedCard(null);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className='flex flex-col grow h-full rounded-[4px] overflow-clip border animate-fade-in bg-background'>
      {selectedCard && (
        <EditFlashcardResponsive
          card={selectedCard}
          onEdit={handleEdit}
          open={open}
          onOpenChange={setOpen}
        />
      )}

      {/* Table container with fixed height */}
      <div className='flex flex-col h-full grow overflow-hidden'>
        <Table ref={tableRef}>
          <TableHeader>
            <TableRow>
              <TableHead className='w-80'>Question</TableHead>
              <TableHead className='w-80'>Answer</TableHead>
              <TableHead className='w-100'>Example</TableHead>
              <TableHead className='w-100'>Translation</TableHead>
              <TableHead className='w-32'>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='body'>
            {paginatedCards.map((card) => (
              <TableRow
                key={card.id}
                onClick={() => {
                  setSelectedCard(card);
                  setOpen(true);
                }}
                className='cursor-pointer hover:bg-muted/50'
              >
                <TableCell className='font-medium'>
                  <div className='truncate'>{card.front}</div>
                </TableCell>
                <TableCell>
                  <div className='truncate'>{card.back}</div>
                </TableCell>
                <TableCell className='text-[14px] text-muted-foreground'>
                  <div className='truncate'>{card.exampleSentence || '-'}</div>
                </TableCell>
                <TableCell className='text-[14px] text-muted-foreground'>
                  <div className='truncate'>{card.exampleSentenceTranslation || '-'}</div>
                </TableCell>
                <TableCell>
                  <div className='truncate'>{new Date(card.createdAt).toLocaleDateString()}</div>
                </TableCell>
              </TableRow>
            ))}

            {/* Fill remaining rows only when there are multiple pages to maintain consistent height */}
            {totalPages > 1 && Array.from({ length: Math.max(0, cardsPerPage - paginatedCards.length) }).map((_, index) => (
              <TableRow key={`empty-${index}`} className='h-[37px] border-0'>
                <TableCell colSpan={5} className='border-0'>&nbsp;</TableCell>
              </TableRow>
            ))}
          </TableBody>

          {cards.length === 0 && (
            <TableFooter>
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-muted-foreground text-center h-16'
                >
                  No cards found
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Pagination - always visible */}
      <div className='flex items-center px-4 py-3 border-t bg-background'>
        {/* 
        <div className='text-sm text-muted-foreground'>
          {cards.length === 0 ? 0 : ((currentPage - 1) * cardsPerPage) + 1} to {Math.min(currentPage * cardsPerPage, cards.length)} of {cards.length} cards
        </div>
        */}
        <div className='flex w-full justify-between items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={goToPrevPage}
            disabled={currentPage === 1 || totalPages === 0}
          >
            <CaretLeft className='h-4 w-4 mr-1' />
          </Button>
          <div className='text-sm text-muted-foreground min-w-[80px] text-center'>
            {totalPages > 0 ? `${currentPage} of ${totalPages}` : 'No pages'}
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <CaretRight className='h-4 w-4 ml-1' />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardTable;