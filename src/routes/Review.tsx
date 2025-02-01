import CardActionButtons from '@/components/card-action-buttons';
import CardCountBadges from '@/components/card-count-badges';
import CurrentCardBadge from '@/components/current-card-badge';
import FlashcardContent from '@/components/flashcard-content';
import { useReviewCards } from '@/components/hooks/query';
import GradeButtons from '@/components/rating-buttons';
import {
  gradeCardOperation,
  updateDeletedClientSide,
} from '@/lib/sync/operation';
import { Fragment } from 'react/jsx-runtime';
import { Grade } from 'ts-fsrs';

export default function ReviewRoute() {
  const reviewCards = useReviewCards();
  const nextReviewCard = reviewCards?.[0];

  async function handleGrade(grade: Grade) {
    if (!nextReviewCard) return;

    await gradeCardOperation(nextReviewCard, grade);
  }

  async function handleDelete() {
    if (!nextReviewCard) return;
    await updateDeletedClientSide(nextReviewCard.id, true);
  }

  return (
    <div className='max-w-4xl h-full flex gap-2 flex-col items-center mx-auto mt-20'>
      <div className='w-full flex justify-between'>
        <div className='flex gap-2'>
          <CardCountBadges />
          {nextReviewCard && <CurrentCardBadge card={nextReviewCard} />}
        </div>
        <CardActionButtons onDelete={handleDelete} />
      </div>

      <div className='flex justify-center items-center gap-2 mb-6 w-full'>
        {nextReviewCard ? (
          <Fragment>
            <FlashcardContent content={nextReviewCard.front} />
            <hr className='my-4' />
            <FlashcardContent content={nextReviewCard.back} />
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
