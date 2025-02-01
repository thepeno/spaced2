import CardActionButtons from '@/components/card-action-buttons';
import CardCountBadges from '@/components/card-count-badges';
import CurrentCardBadge from '@/components/current-card-badge';
import FlashcardContent from '@/components/flashcard-content';
import { useReviewCards } from '@/components/hooks/query';
import GradeButtons from '@/components/rating-buttons';
import {
  gradeCardOperation,
  updateBookmarkedClientSide,
  updateDeletedClientSide,
  updateSuspendedClientSide,
} from '@/lib/sync/operation';
import { cn } from '@/lib/utils';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Fragment } from 'react/jsx-runtime';
import { Grade } from 'ts-fsrs';

function tenMinutesFromNow(): Date {
  const now = new Date();
  return new Date(now.getTime() + 10 * 60 * 1000);
}

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

  async function handleSuspend() {
    if (!nextReviewCard) return;
    await updateSuspendedClientSide(nextReviewCard.id, tenMinutesFromNow());
  }

  async function handleBookmark(bookmarked: boolean) {
    if (!nextReviewCard) return;
    await updateBookmarkedClientSide(nextReviewCard.id, bookmarked);
  }

  return (
    <div
      className={cn(
        'grid grid-cols-12 gap-x-6 items-start',
        'col-start-1 col-end-13',
        'md:col-start-3 md:col-end-11 md:grid-cols-8',
        'md:mt-12 mb-6'
      )}
    >
      <div className='relative col-span-12 flex flex-col gap-x-4 gap-y-2 bg-background rounded-xl px-1 md:px-4 pt-4 h-full'>
        <div className='w-full flex flex-col-reverse sm:flex-row justify-between items-center gap-4'>
          <div className='flex gap-2'>
            <CardCountBadges />
            {nextReviewCard && <CurrentCardBadge card={nextReviewCard} />}
          </div>
          <CardActionButtons
            onDelete={handleDelete}
            onSkip={handleSuspend}
            onBookmark={handleBookmark}
            bookmarked={nextReviewCard?.bookmarked}
          />
        </div>

        <div className='flex flex-col md:flex-row justify-stretch md:justify-center items-center gap-2 lg:gap-4 w-full h-full'>
          {nextReviewCard ? (
            <Fragment>
              <FlashcardContent content={nextReviewCard.front} />
              <Separator className='sm:hidden bg-muted w-[95%] h-0.5' />
              <FlashcardContent content={nextReviewCard.back} />
            </Fragment>
          ) : (
            <div>No cards to review</div>
          )}
        </div>

        <div className='w-full sm:static sm:mx-auto sm:mt-2 sm:w-max mb-4'>
          {nextReviewCard && (
            <GradeButtons onGrade={handleGrade} card={nextReviewCard} />
          )}
        </div>
      </div>
    </div>
  );
}
