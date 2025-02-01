import {
    Table,
    TableBody,
    TableCell,
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
            <TableHead className='w-48'>Front</TableHead>
            <TableHead className='w-48'>Back</TableHead>
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
      </Table>
    </div>
  );
};

export default FlashcardTable;
