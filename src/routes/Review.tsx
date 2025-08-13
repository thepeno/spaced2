import EditFlashcardResponsive from '@/components/card-actions/edit-flashcard-responsive';
import CardCountBadges from '@/components/card-count-badges';
import { useActiveStartTime } from '@/components/hooks/inactivity';
import { useCards, useReviewCards } from '@/components/hooks/query';
import DeleteFlashcardDialog from '@/components/review/delete-flashcard-dialog';
import EmptyReviewUi from '@/components/review/empty';
import SimplifiedReviewCard from '@/components/review/simplified-review-card';
import SimplifiedGradeButtons from '@/components/review/simplified-grade-buttons';
import { CardContentFormValues } from '@/lib/form-schema';
import {
  handleCardBury,
  handleCardDelete,
  handleCardEdit,
  handleCardSave,
  handleCardSuspend,
} from '@/lib/review/actions';
import { gradeCardOperation } from '@/lib/sync/operation';
import { reviewSession } from '@/lib/review-session';
import { useState, useEffect } from 'react';
import { Grade, Rating } from 'ts-fsrs';

export default function ReviewRoute() {
  const allCards = useCards();
  const noCardsCreatedYet = allCards.length === 0;

  const reviewCards = useReviewCards();
  const nextReviewCard = reviewCards?.[0];

  const start = useActiveStartTime({ id: nextReviewCard?.id });

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // Clear session when component unmounts (user leaves review)
  useEffect(() => {
    return () => {
      reviewSession.clearSession();
    };
  }, []);

  async function handleEdit(values: CardContentFormValues) {
    await handleCardEdit(values, nextReviewCard);
    setIsEditing(false);
  }

  async function handleGrade(grade: Grade) {
    if (!nextReviewCard) return;
    
    // Handle session-based review logic
    if (grade === Rating.Again) {
      // Add to delayed review queue (will reappear after delay)
      reviewSession.addToDelayedReview(nextReviewCard.id);
    } else {
      // Remove from immediate review queue (Good or better)
      reviewSession.removeFromImmediateReview(nextReviewCard.id);
      // Mark as completed in this session
      reviewSession.markCardCompleted(nextReviewCard.id);
    }
    
    // Increment review count to track session progress
    reviewSession.incrementReviewCount();
    
    await gradeCardOperation(nextReviewCard, grade, Date.now() - start);
    setIsRevealed(false); // Reset for next card
  }

  async function handleDelete() {
    if (nextReviewCard) {
      // Remove from immediate review queue when deleted
      reviewSession.removeFromImmediateReview(nextReviewCard.id);
      await handleCardDelete(nextReviewCard);
    }
    setIsDeleteDialogOpen(false);
  }

  async function handleSuspend() {
    if (nextReviewCard) {
      // Remove from immediate review queue when suspended
      reviewSession.removeFromImmediateReview(nextReviewCard.id);
      await handleCardSuspend(nextReviewCard);
    }
  }

  async function handleBury() {
    if (nextReviewCard) {
      // Remove from immediate review queue when buried
      reviewSession.removeFromImmediateReview(nextReviewCard.id);
      await handleCardBury(nextReviewCard);
    }
  }

  async function handleSave(bookmarked: boolean) {
    await handleCardSave(bookmarked, nextReviewCard);
  }

  return (
    <div className="flex grow flex-col h-full justify-center max-w-4xl mx-auto w-full">
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

      {/* Main review area */}
      <div className="flex-1 flex flex-col justify-center">
        {nextReviewCard ? (
          <>
            <div className='flex flex-col gap-3 h-full grow relative'>
              {/* Card count badges overlay */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <CardCountBadges />
              </div>

              {/* Review card */}
              <SimplifiedReviewCard
                card={nextReviewCard}
                onGrade={handleGrade}
                isRevealed={isRevealed}
                onReveal={() => setIsRevealed(true)}
                onBookmark={handleSave}
                onDelete={() => setIsDeleteDialogOpen(true)}
                onSuspend={handleSuspend}
                onBury={handleBury}
                onEdit={() => setIsEditing(true)}
              />

              {/* Grade buttons */}
              <SimplifiedGradeButtons
                onGrade={handleGrade}
                visible={isRevealed}
              />
            </div>
          </>
        ) : (
          <EmptyReviewUi noCardsCreatedYet={noCardsCreatedYet} />
        )}
      </div>

    </div>
  );
}
