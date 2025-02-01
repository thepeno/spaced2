import { useCardsForDeck, useDeck } from '@/components/hooks/query';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { BookIcon, Clock } from 'lucide-react';
import { Link } from 'react-router';

type Props = {
  id: string;
};

export function DeckSkeleton() {
  return <Skeleton className='h-24 w-full sm:h-36 sm:w-72' />;
}

export default function DeckCard({ id }: Props) {
  const deck = useDeck(id);
  const cards = useCardsForDeck(id);

  if (!deck) {
    return <DeckSkeleton />;
  }

  return (
    // z-0 is to ensure that border div is rendered above the background but below the card
    <Link to={`/decks/${id}`} className='z-0 w-full sm:w-max'>
      <Card className='group relative flex h-full w-full cursor-pointer flex-col items-start justify-start gap-y-1 border-background bg-muted px-4 py-3 pb-10 text-background shadow-sm sm:shadow-md transition duration-300 hover:shadow-sm sm:h-36 sm:w-72 sm:gap-y-2 sm:py-6 sm:pb-6'>
        <div className='-z-10 absolute inset-0 -right-[0.65rem] -top-2 h-[103%] scale-[98%] rounded-xl border border-background bg-muted/70 transition duration-200 ease-in group-hover:border group-hover:border-primary'></div>
        <CardTitle className='text-lg text-primary sm:text-xl'>
          {deck.name}
        </CardTitle>
        <CardDescription className='line-clamp-1'>
          {deck.description}
        </CardDescription>
        <>
          <div className='absolute bottom-3 left-4 flex items-center text-muted-foreground'>
            <Clock className='mr-1 h-3 w-3 sm:h-4 sm:w-4' />
            <span className='text-xs sm:text-sm'>
              {format(new Date(deck.lastModified), 'MMM d')}
            </span>
          </div>

          <span className='absolute bottom-3 right-4 ml-auto mt-4 flex w-max items-center justify-center rounded-md text-xs text-muted-foreground sm:text-sm'>
            <BookIcon className='mr-1 h-3 w-3 sm:h-4 sm:w-4' />
            {cards.length}
          </span>
        </>
      </Card>
    </Link>
  );
}

DeckCard.displayName = 'Deck';
