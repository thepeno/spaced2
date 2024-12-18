import GradeButtons from '@/components/rating-buttons';
import { db } from '@/lib/db';
import { useFlashcardReviewQuery } from '@/lib/query';
import { gradeCard } from '@/lib/review';
import { markdownToHtml } from '@/lib/utils';
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
    <div>
      <h1 className='text-2xl font-bold mb-4'>Review cards</h1>
      <div className='flex flex-wrap gap-2 mb-6 border border-1 shadow-md p-2'>
        {nextReviewCard ? (
          <div className='w-40 h-80 flex flex-col justify-between'>
            <article
              className='prose'
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(nextReviewCard.question),
              }}
            ></article>
            <hr className='my-4' />
            <article
              className='prose'
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(nextReviewCard.answer),
              }}
            ></article>
          </div>
        ) : (
          <div>No cards to review</div>
        )}
      </div>

      <GradeButtons onGrade={handleGrade} />
    </div>
  );
}
