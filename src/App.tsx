import { CreateFlashcardForm } from '@/components/create-flashcard';
import Flashcard from '@/components/flashcard';
import { useReadCards } from '@/components/hooks/db';
import { buttonVariants } from '@/components/ui/button';
import { createNewCard } from '@/lib/sync/operation';
import { useMemo } from 'react';
import { Link } from 'react-router';

function App() {
  const cards = useReadCards();
  const reviewCards = cards.filter((card) => card.due < new Date());

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
