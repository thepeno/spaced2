import { CreateFlashcardForm } from '@/components/create-flashcard';
import Flashcard from '@/components/flashcard';
import GradeButtons from '@/components/rating-buttons';
import { db } from '@/lib/db';
import { useFlashcardReviewQuery } from '@/lib/query';
import { gradeCard } from '@/lib/review';
import { CardWithContent } from '@/lib/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { createEmptyCard, Grade } from 'ts-fsrs';

function App() {
  const cards = useLiveQuery(() => db.cards.toArray());
  const reviewCards = useFlashcardReviewQuery();
  const reviewSet = useMemo(
    () => new Set(reviewCards?.map((card) => card.id)),
    [reviewCards]
  );
  const nextReviewCard = reviewCards?.[0];

  function handleGrade(grade: Grade) {
    if (!nextReviewCard) return;

    const { nextCard } = gradeCard(nextReviewCard, grade);
    db.cards.update(nextCard.id, {
      ...nextCard,
      due: nextCard.due,
    });
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
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

      <h1 className='text-2xl font-bold mb-4'>Review cards</h1>
      <div className='flex flex-wrap gap-2 mb-6 border border-1 shadow-md p-2'>
        {nextReviewCard ? (
          <div className='w-40 h-80 flex flex-col'>
            <div>{nextReviewCard.question}</div>
            <div>{nextReviewCard.answer}</div>
          </div>
        ) : (
          <div>No cards to review</div>
        )}
      </div>

      <GradeButtons onGrade={handleGrade} />

      <CreateFlashcardForm
        onSubmit={(data) => {
          const now = Date.now();
          const card: CardWithContent = {
            ...createEmptyCard(),
            id: crypto.randomUUID(),
            question: data.question,
            answer: data.answer,
            created_at: now,
            updated_at: now,
          };

          db.cards.add(card);
        }}
      />
    </div>
  );
}

export default App;
