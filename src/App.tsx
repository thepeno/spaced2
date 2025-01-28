import { CreateFlashcardForm } from '@/components/create-flashcard';
import Flashcard from '@/components/flashcard';
import { buttonVariants } from '@/components/ui/button';
import { db } from '@/lib/db';
import { createNewCard } from '@/lib/operation';
import { useFlashcardReviewQuery } from '@/lib/query';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { Link } from 'react-router';

function App() {
  const cards = useLiveQuery(() => db.cards.toArray());
  const reviewCards = useFlashcardReviewQuery();
  const reviewSet = useMemo(
    () => new Set(reviewCards?.map((card) => card.id)),
    [reviewCards]
  );

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='flex justify-end w-full'>
        <Link to='/review' className={buttonVariants({ variant: 'outline' })}>
          Review
        </Link>
      </div>

      <h1 className='text-2xl font-bold mb-4'>All cards</h1>

      <div className='flex flex-wrap gap-2 mb-6 border border-1 shadow-md p-2'>
        {cards?.map((card) => (
          <Flashcard
            key={card.id}
            card={card}
            isReview={reviewSet.has(card.id)}
          />
        ))}
      </div>

      <CreateFlashcardForm
        onSubmit={(data) => {
          createNewCard(data.question, data.answer);
        }}
      />
    </div>
  );
}

export default App;
