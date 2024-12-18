import CardCountBadges from '@/components/card-count-badges';
import GradeButtons from '@/components/rating-buttons';
import { db } from '@/lib/db';
import { useFlashcardReviewQuery } from '@/lib/query';
import { gradeCard } from '@/lib/review';
import { markdownToHtml } from '@/lib/utils';
import { Fragment } from 'react/jsx-runtime';
import { Grade } from 'ts-fsrs';

export default function ReviewRoute() {
  const reviewCards = useFlashcardReviewQuery();
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
    <div className='max-w-4xl h-full flex flex-col items-center mx-auto mt-12'>
      <h1 className='text-2xl font-bold mb-4'>Review cards</h1>
      <div className='w-full flex justify-between'>
        <CardCountBadges />
        <div>action buttons</div>
      </div>
      <div className='flex justify-center items-center gap-2 mb-6 w-full'>
        {nextReviewCard ? (
          <Fragment>
            <article
              className='prose h-96 flex-1 border border-1 p-2 rounded-sm flex flex-col items-center justify-center shadow-sm'
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(nextReviewCard.question),
              }}
            ></article>
            <hr className='my-4' />
            <article
              className='prose h-96 flex-1 border border-1 p-2 rounded-sm flex flex-col items-center justify-center shadow-sm'
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(nextReviewCard.answer),
              }}
            ></article>
          </Fragment>
        ) : (
          <div>No cards to review</div>
        )}
      </div>

      {nextReviewCard && (
        <GradeButtons onGrade={handleGrade} card={nextReviewCard} />
      )}
    </div>
  );
}
