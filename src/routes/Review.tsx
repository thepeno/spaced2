import EditFlashcardResponsive from '@/components/card-actions/edit-flashcard-responsive';
import CardCountBadges from '@/components/card-count-badges';
import { useActiveStartTime } from '@/components/hooks/inactivity';
import { useCards, useReviewCards, useDeck } from '@/components/hooks/query';
import DeleteFlashcardDialog from '@/components/review/delete-flashcard-dialog';
import EmptyReviewUi from '@/components/review/empty';
import SimplifiedReviewCard from '@/components/review/simplified-review-card';
import SimplifiedGradeButtons from '@/components/review/simplified-grade-buttons';
import { Button } from '@/components/ui/button';
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
import { ttsManager } from '@/lib/tts/tts-manager';
import { useState, useEffect } from 'react';
import { Grade, Rating } from 'ts-fsrs';
import { useParams, useNavigate } from 'react-router';

export default function ReviewRoute() {
  const params = useParams();
  const navigate = useNavigate();
  const deckId = params.deckId as string | undefined;
  
  const allCards = useCards();
  const noCardsCreatedYet = allCards.length === 0;
  
  // Always call the hook, but pass empty string if no deckId
  const deck = useDeck(deckId || '');

  const reviewCards = useReviewCards(deckId);
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
    
    // Stop any playing TTS before moving to the next card
    ttsManager.stop();
    
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
    <div className="flex grow flex-col h-full justify-center max-w-4xl mx-auto w-full px-5 pb-2 pt-6">
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

      {/* Navigation buttons - only show for deck-specific reviews */}
      {deckId && deck && (
        <div className="flex gap-3 mb-4 justify-center">
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 hover:bg-transparent p-2"
            onClick={() => navigate('/decks')}
          >
            All decks
          </Button>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 hover:bg-transparent p-2"
            onClick={() => navigate(`/?deck=${deckId}`)}
          >
            Add
          </Button>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 hover:bg-transparent p-2"
            onClick={() => nextReviewCard && setIsEditing(true)}
            disabled={!nextReviewCard}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 hover:bg-transparent p-2"
            onClick={() => navigate(`/decks/${deckId}/browse`)}
          >
            Browse
          </Button>
        </div>
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
                targetLanguage={deck?.targetLanguage}
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
