import { Card } from '@/components/ui/card';
import { CardWithMetadata } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import ActionsDropdownMenu from '@/components/review/actions-dropdown-menu';
import UndoGradeButton from '@/components/review/undo-grade-button';
import { Rating } from 'ts-fsrs';

type Grade = Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;

interface SimplifiedReviewCardProps {
  card: CardWithMetadata;
  onGrade: (grade: Grade) => void;
  isRevealed: boolean;
  onReveal: () => void;
  // Actions menu props
  onBookmark: (bookmarked: boolean) => void;
  onDelete: () => void;
  onSuspend: () => void;
  onBury: () => void;
  onEdit: () => void;
}

export default function SimplifiedReviewCard({
  card,
  onGrade,
  isRevealed,
  onReveal,
  onBookmark,
  onDelete,
  onSuspend,
  onBury,
  onEdit,
}: SimplifiedReviewCardProps) {
  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Don't trigger card actions if clicking on the menu area
    if ((event.target as HTMLElement).closest('[data-menu-area]')) {
      return;
    }

    if (!isRevealed) {
      onReveal();
      return;
    }

    // Determine if click was on left or right side
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;

    if (x < width / 2) {
      // Left side clicked - Again
      onGrade(Rating.Again);
    } else {
      // Right side clicked - Good
      onGrade(Rating.Good);
    }
  };

  return (
    <Card
      className={cn(
        "w-full h-full grow shadow-none border cursor-pointer transition-all rounded-[12px]",
        "flex flex-col relative"
      )}
      onClick={handleCardClick}
    >
      {/* Undo button in top left corner */}
      <div 
        className="absolute top-2 left-2 z-10"
        data-menu-area
      >
        <UndoGradeButton />
      </div>

      {/* Actions menu in top right corner */}
      <div 
        className="absolute top-2 right-2 z-10"
        data-menu-area
      >
        <ActionsDropdownMenu
          bookmarked={card.bookmarked}
          handleBookmark={onBookmark}
          handleDelete={onDelete}
          handleSkip={onSuspend}
          handleBury={onBury}
          handleEdit={onEdit}
        />
      </div>

      {!isRevealed ? (
        // Front of card - question only
        <div className="flex grow flex-col items-center justify-center p-6 text-center h-full">
          <p className="text-lg font-semibold mb-4">
            {card.front}
          </p>
          {card.exampleSentence && (
            <p className="text-base">
              {card.exampleSentence}
            </p>
          )}
        </div>
      ) : (
        // Revealed card - split view
        <>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-lg font-semibold mb-4">
              {card.front}
            </p>
            {card.exampleSentence && (
              <p className="text-base">
                {card.exampleSentence}
              </p>
            )}
          </div>

          <Separator orientation="horizontal" className="w-auto" />

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-lg font-semibold mb-4">
              {card.back}
            </p>
            {card.exampleSentenceTranslation && (
              <p className="text-base">
                {card.exampleSentenceTranslation}
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
}