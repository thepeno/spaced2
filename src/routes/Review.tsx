import EditFlashcardResponsive from '@/components/card-actions/edit-flashcard-responsive';
import CardCountBadges from '@/components/card-count-badges';
import CurrentCardBadge from '@/components/current-card-badge';
import FlashcardContent from '@/components/flashcard-content';
import { useActiveStartTime } from '@/components/hooks/inactivity';
import { useCards, useReviewCards } from '@/components/hooks/query';
import ActionsDropdownMenu from '@/components/review/actions-dropdown-menu';
import DeleteFlashcardDialog from '@/components/review/delete-flashcard-dialog';
import EmptyReviewUi from '@/components/review/empty';
import GradeButtons from '@/components/review/grade-buttons';
import MobileGradeButtons from '@/components/review/mobile-grade-buttons';
import ReviewCarousel from '@/components/review/review-carousel';
import { Separator } from '@/components/ui/separator';
import { CardContentFormValues } from '@/lib/form-schema';
import {
  gradeCardOperation,
  updateBookmarkedClientSide,
  updateCardContentOperation,
  updateDeletedClientSide,
  updateSuspendedClientSide,
} from '@/lib/sync/operation';
import { cn, MAX_DATE } from '@/lib/utils';
import VibrationPattern from '@/lib/vibrate';
import { useMediaQuery } from '@uidotdev/usehooks';
import {
  BookmarkIcon,
  ChevronsRight,
  EyeOff,
  Redo2,
  Trash,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Grade } from 'ts-fsrs';

function tenMinutesFromNow(): Date {
  const now = new Date();
  return new Date(now.getTime() + 10 * 60 * 1000);
}

export default function ReviewRoute() {
  const allCards = useCards();
  const noCardsCreatedYet = allCards.length === 0;

  const reviewCards = useReviewCards();
  const nextReviewCard = reviewCards?.[0];

  const start = useActiveStartTime({ id: nextReviewCard?.id });
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = async (values: CardContentFormValues) => {
    if (!nextReviewCard) return;

    const hasChanged =
      nextReviewCard.front !== values.front ||
      nextReviewCard.back !== values.back;

    if (hasChanged) {
      updateCardContentOperation(nextReviewCard.id, values.front, values.back);
    }
    setIsEditing(false);
  };

  async function handleGrade(grade: Grade) {
    if (!nextReviewCard) return;

    await gradeCardOperation(nextReviewCard, grade, Date.now() - start);
  }

  async function handleDelete() {
    if (!nextReviewCard) return;
    await updateDeletedClientSide(nextReviewCard.id, true);
    toast('Card deleted', {
      icon: <Trash className='size-4' />,
    });
    setIsDeleteDialogOpen(false);
  }

  async function handleSuspend() {
    if (!nextReviewCard) return;
    await updateSuspendedClientSide(nextReviewCard.id, tenMinutesFromNow());
    navigator?.vibrate(VibrationPattern.buttonTap);
    toast('Skipped for 10 minutes', {
      icon: <ChevronsRight className='size-4' />,
    });
  }

  async function handleBury() {
    if (!nextReviewCard) return;
    await updateSuspendedClientSide(nextReviewCard.id, MAX_DATE);
    navigator?.vibrate(VibrationPattern.buttonTap);
    toast("You won't see this card again", {
      icon: <EyeOff className='size-4' />,
    });
  }

  async function handleSave(bookmarked: boolean) {
    if (!nextReviewCard) return;

    await updateBookmarkedClientSide(nextReviewCard.id, bookmarked);
    if (bookmarked) {
      navigator?.vibrate(VibrationPattern.successConfirm);
      toast('Saved', {
        icon: (
          <BookmarkIcon className='size-4 text-primary' fill='currentColor' />
        ),
      });
    } else {
      toast('Removed from saved');
    }
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
      <div className='relative col-span-12 flex flex-col gap-x-4 gap-y-0 sm:gap-y-2 bg-background rounded-t-2xl sm:rounded-b-2xl px-1 md:px-4 p-4 h-full animate-fade-in'>
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

        {/* Actions dropdown menu */}
        {nextReviewCard && (
          <div className='absolute top-1 sm:top-2 right-3 flex'>
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

        <div className='w-full flex flex-col-reverse sm:flex-row justify-between items-center gap-4'>
          <div className='flex gap-2'>
            <CardCountBadges />
            {nextReviewCard && <CurrentCardBadge card={nextReviewCard} />}
          </div>
        </div>

        <div className='flex flex-col md:flex-row justify-stretch md:justify-center items-center gap-2 lg:gap-4 w-full h-full'>
          {nextReviewCard ? (
            <div className='w-full hidden sm:flex gap-2'>
              <FlashcardContent content={nextReviewCard.front} />
              <Separator className='sm:hidden bg-muted w-[95%] h-0.5' />
              <FlashcardContent content={nextReviewCard.back} />
            </div>
          ) : (
            <EmptyReviewUi noCardsCreatedYet={noCardsCreatedYet} />
          )}
          {nextReviewCard && <ReviewCarousel card={nextReviewCard} />}
        </div>
      </div>

      <div className='col-span-12 w-full hidden sm:block sm:mx-auto sm:mt-2 sm:w-max mb-4 px-4 pb-2'>
        {nextReviewCard && !isMobile && (
          <GradeButtons onGrade={handleGrade} card={nextReviewCard} />
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
