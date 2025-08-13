import { Card } from '@/components/ui/card';
import { Link } from 'react-router';

export type DeckCardProps = {
  id: string;
  name: string;
  unreviewedCount: number;
};

/**
 * Simplified deck card with just name and unreviewed count
 */
export default function DeckCard({
  id,
  name,
  unreviewedCount,
}: DeckCardProps) {
  return (
    <Link to={`/decks/${id}`} className='w-full'>
      <Card className='group cursor-pointer border border-border bg-background px-4 py-3 transition-colors hover:bg-accent hover:text-accent-foreground shadow-none rounded-[12px]'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>
            {name}
          </span>
          <span className='text-sm text-primary font-medium'>
            {unreviewedCount}
          </span>
        </div>
      </Card>
    </Link>
  );
}
