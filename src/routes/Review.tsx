import EditFlashcardResponsive from '@/components/card-actions/edit-flashcard-responsive';
import CardCountBadges from '@/components/card-count-badges';
import CurrentCardBadge from '@/components/current-card-badge';
import FlashcardContent from '@/components/flashcard-content';
import { useActiveStartTime } from '@/components/hooks/inactivity';
import { useCards, useReviewCards } from '@/components/hooks/query';
import ActionsDropdownMenu from '@/components/review/actions-dropdown-menu';
import DeleteFlashcardDialog from '@/components/review/delete-flashcard-dialog';
import DesktopActionsContextMenu from '@/components/review/desktop-actions-context-menu';
import EmptyReviewUi from '@/components/review/empty';
import DesktopGradeButtons from '@/components/review/grade-buttons';
import MobileGradeButtons from '@/components/review/mobile-grade-buttons';
import MobileReviewCarousel from '@/components/review/review-carousel';
import { Separator } from '@/components/ui/separator';
import { CardContentFormValues } from '@/lib/form-schema';
import {
  handleCardBury,
  handleCardDelete,
  handleCardEdit,
  handleCardSave,
  handleCardSuspend,
} from '@/lib/review/actions';
import { gradeCardOperation } from '@/lib/sync/operation';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@uidotdev/usehooks';
import { Redo2 } from 'lucide-react';
import { useState } from 'react';
import { Grade } from 'ts-fsrs';

export default function ReviewRoute() {
  const allCards = useCards();
  const noCardsCreatedYet = allCards.length === 0;

  const reviewCards = useReviewCards();
  const nextReviewCard = reviewCards?.[0];

  const start = useActiveStartTime({ id: nextReviewCard?.id });
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  async function handleEdit(values: CardContentFormValues) {
    await handleCardEdit(values, nextReviewCard);
    setIsEditing(false);
  }

  async function handleGrade(grade: Grade) {
    if (!nextReviewCard) return;
    await gradeCardOperation(nextReviewCard, grade, Date.now() - start);
  }

  async function handleDelete() {
    await handleCardDelete(nextReviewCard);
    setIsDeleteDialogOpen(false);
  }

  async function handleSuspend() {
    await handleCardSuspend(nextReviewCard);
  }

  async function handleBury() {
    await handleCardBury(nextReviewCard);
  }

  async function handleSave(bookmarked: boolean) {
    await handleCardSave(bookmarked, nextReviewCard);
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
      <DeleteFlashcardDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
      />

      {nextReviewCard && (
        <EditFlashcardResponsive
          card={nextReviewCard}
          open={isEditing}
          onOpenChange={setIsEditing}
          onEdit={handleEdit}
        />
      )}
      <DesktopActionsContextMenu
        bookmarked={nextReviewCard?.bookmarked}
        handleBookmark={handleSave}
        handleDelete={() => setIsDeleteDialogOpen(true)}
        handleSkip={handleSuspend}
        handleBury={handleBury}
        handleEdit={() => setIsEditing(true)}
      >
        <div
          className={cn(
            'relative col-span-12 flex flex-col gap-x-4 gap-y-0 sm:gap-y-1 bg-background/60 backdrop-blur-sm dark:bg-muted/70 rounded-t-2xl sm:rounded-b-2xl px-1 md:px-0 pt-1 h-full animate-fade-in',
            'dark:border',
            'shadow-lg'
          )}
        >
          {/* Actions dropdown menu */}
          {nextReviewCard && (
            <div className='absolute top-1 sm:-top-1 right-2 flex'>
              <div className='px-2 py-3'>
                <Redo2 className='size-6 text-muted-foreground/50 hover:text-muted-foreground transition-all rotate-180' />
              </div>

              <ActionsDropdownMenu
                bookmarked={nextReviewCard?.bookmarked}
                handleBookmark={handleSave}
                handleDelete={() => setIsDeleteDialogOpen(true)}
                handleSkip={handleSuspend}
                handleBury={handleBury}
                handleEdit={() => setIsEditing(true)}
              />
            </div>
          )}

          <div className='w-full flex flex-col-reverse sm:flex-row justify-between items-center gap-4 px-2'>
            <div className='flex gap-2 items-center ml-2'>
              <CardCountBadges />
              {nextReviewCard && <CurrentCardBadge card={nextReviewCard} />}
            </div>
          </div>

          <div className='flex flex-col md:flex-row justify-stretch md:justify-center items-center gap-2 lg:gap-4 w-full h-full bg-background rounded-b-2xl border-t'>
            {nextReviewCard ? (
              <div className='w-full hidden sm:flex items-center gap-6 p-6'>
                <FlashcardContent content={nextReviewCard.front} />
                <FlashcardContent content={nextReviewCard.back} />
              </div>
            ) : (
              <EmptyReviewUi noCardsCreatedYet={noCardsCreatedYet} />
            )}
            {nextReviewCard && <MobileReviewCarousel card={nextReviewCard} />}
          </div>
        </div>
      </DesktopActionsContextMenu>

      <div className='col-span-12 w-full hidden sm:block sm:mx-auto sm:w-max mb-4 px-4 pb-2'>
        {nextReviewCard && !isMobile && (
          <DesktopGradeButtons onGrade={handleGrade} card={nextReviewCard} />
        )}
      </div>
      <div className='col-span-12 mt-0'>
        {nextReviewCard && isMobile && (
          <MobileGradeButtons onGrade={handleGrade} />
        )}
      </div>
    </div>
  );
}
