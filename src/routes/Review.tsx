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
import { cn } from '@/lib/utils';
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
    <div
      className={cn(
        'grid grid-cols-12 gap-x-6 items-start',
        'col-start-1 col-end-13',
        'xl:col-start-3 xl:col-end-11 xl:grid-cols-8',
        'md:mt-12 px-2'
      )}
    >
      <div className='relative col-span-12 flex flex-col gap-x-4 gap-y-2 overflow-hidden'>
        <div className='w-full flex justify-between'>
          <div className='flex gap-2'>
            <CardCountBadges />
            {nextReviewCard && <CurrentCardBadge card={nextReviewCard} />}
          </div>
          <CardActionButtons onDelete={handleDelete} />
        </div>

        <div className='flex flex-col md:flex-row justify-stretch md:justify-center items-center gap-1 md:gap-2 md:mb-6 w-full h-[70vh] md:h-full'>
          {nextReviewCard ? (
            <Fragment>
              <FlashcardContent content={nextReviewCard.front} />
              <FlashcardContent content={nextReviewCard.back} />
            </Fragment>
          ) : (
            <div>No cards to review</div>
          )}
        </div>

        <div className='z-20 mb-6 w-full sm:static sm:mx-auto sm:mt-2 sm:w-max'>
          {nextReviewCard && (
            <GradeButtons onGrade={handleGrade} card={nextReviewCard} />
          )}
        </div>
      </div>
    </div>
  );
}
