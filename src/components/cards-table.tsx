import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CardWithMetadata } from '@/lib/types';

const FlashcardTable = ({ cards }: { cards: CardWithMetadata[] }) => {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-48'>Question</TableHead>
            <TableHead className='w-48'>Answer</TableHead>
            <TableHead className='w-32'>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id}>
              <TableCell className='font-medium'>{card.front}</TableCell>
              <TableCell>{card.back}</TableCell>
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
                colSpan={3}
                className='text-muted-foreground text-center'
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
