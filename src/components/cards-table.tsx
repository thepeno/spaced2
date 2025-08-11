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
import { CardContentFormValues } from '@/lib/form-schema';
import { updateCardContentOperation, updateCardExampleSentenceOperation } from '@/lib/sync/operation';
import { CardWithMetadata } from '@/lib/types';
import { useState } from 'react';

const FlashcardTable = ({ cards }: { cards: CardWithMetadata[] }) => {
  const [selectedCard, setSelectedCard] = useState<CardWithMetadata | null>(
    null
  );
  const [open, setOpen] = useState(false);

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
    <div className='rounded-md border animate-fade-in'>
      {selectedCard && (
        <EditFlashcardResponsive
          card={selectedCard}
          onEdit={handleEdit}
          open={open}
          onOpenChange={setOpen}
        />
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-48'>Question</TableHead>
            <TableHead className='w-48'>Answer</TableHead>
            <TableHead className='w-40'>Example</TableHead>
            <TableHead className='w-32'>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow
              key={card.id}
              onClick={() => {
                setSelectedCard(card);
                setOpen(true);
              }}
            >
              <TableCell className='font-medium'>{card.front}</TableCell>
              <TableCell>{card.back}</TableCell>
              <TableCell className='text-sm text-muted-foreground'>
                {card.exampleSentence ? (
                  <div>
                    <div className='truncate max-w-32'>{card.exampleSentence}</div>
                    {card.exampleSentenceTranslation && (
                      <div className='truncate max-w-32 text-xs opacity-75'>
                        {card.exampleSentenceTranslation}
                      </div>
                    )}
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {new Date(card.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {cards.length === 0 && (
          <TableFooter>
            <TableRow>
              <TableCell
                colSpan={4}
                className='text-muted-foreground text-center h-16'
              >
                No cards found
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
};

export default FlashcardTable;
