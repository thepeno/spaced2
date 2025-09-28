import { Card } from '@/components/ui/card';
import { CardWithMetadata } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import ActionsDropdownMenu from '@/components/review/actions-dropdown-menu';
import UndoGradeButton from '@/components/review/undo-grade-button';
import { TTSButton } from '@/components/tts/tts-button';
import { ClickableText } from '@/components/tts/clickable-text';
import { useTTSSettings } from '@/components/hooks/tts-settings';
import { ttsManager } from '@/lib/tts/tts-manager';
import { Rating } from 'ts-fsrs';
import { useEffect } from 'react';

type Grade = Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;

interface SimplifiedReviewCardProps {
  card: CardWithMetadata;
  onGrade: (grade: Grade) => void;
  isRevealed: boolean;
  onReveal: () => void;
  targetLanguage?: string | null;
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
  targetLanguage,
  onBookmark,
  onDelete,
  onSuspend,
  onBury,
  onEdit,
}: SimplifiedReviewCardProps) {
  const ttsSettings = useTTSSettings();

  // Use the isReverse property to determine which side has target language content
  // For forward cards (isReverse = false): front = target, back = native
  // For reverse cards (isReverse = true): front = native, back = target
  const isTargetOnFront = !card.isReverse;
  const targetText = isTargetOnFront ? card.front : card.back;
  
  // Example sentences: for forward cards, exampleSentence is target language
  // For reverse cards, exampleSentenceTranslation is target language (they get swapped during creation)
  const targetExampleSentence = isTargetOnFront ? card.exampleSentence : card.exampleSentenceTranslation;

  // Auto-play TTS when target language text is shown
  useEffect(() => {
    if (ttsSettings.autoPlay && targetLanguage && targetText) {
      // Play when target is on front and not revealed, or when target is on back and revealed
      const shouldPlay = isTargetOnFront ? !isRevealed : isRevealed;
      
      if (shouldPlay) {
        // Small delay to ensure smooth transition
        const timer = setTimeout(async () => {
          try {
            // Stop any currently playing TTS to prevent overlapping
            ttsManager.stop();
            
            // Play the target language text
            await ttsManager.speak(targetText, targetLanguage);

            // Then play the target language example sentence if it exists
            if (targetExampleSentence) {
              // Small pause between word and example
              await new Promise(resolve => setTimeout(resolve, 500));
              await ttsManager.speak(targetExampleSentence, targetLanguage);
            }
          } catch (error) {
            console.warn('Auto-play TTS failed:', error);
          }
        }, 300);

        return () => {
          clearTimeout(timer);
          // Stop TTS when cleaning up
          ttsManager.stop();
        };
      }
    }
  }, [isRevealed, ttsSettings.autoPlay, targetLanguage, targetText, isTargetOnFront, targetExampleSentence]);
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
        <div className="flex grow flex-col items-center justify-center p-6 text-center h-full pt-12">
          <div className="flex flex-col items-center mb-4">
            <ClickableText text={isTargetOnFront ? card.front : ''} language={targetLanguage}>
              <p className="text-lg font-semibold mb-2">
                {card.front}
              </p>
            </ClickableText>
            {isTargetOnFront && (
              <div data-menu-area>
                <TTSButton 
                  text={card.front} 
                  language={targetLanguage}
                  size="sm"
                />
              </div>
            )}
          </div>
          {(card.exampleSentence || card.exampleSentenceTranslation) && (
            <div className="flex flex-col items-center">
              <ClickableText text={isTargetOnFront ? targetExampleSentence || '' : ''} language={targetLanguage}>
                <p className="text-base mb-2">
                  {card.exampleSentence}
                </p>
              </ClickableText>
              {isTargetOnFront && targetExampleSentence && (
                <div data-menu-area>
                  <TTSButton 
                    text={targetExampleSentence} 
                    language={targetLanguage}
                    size="sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Revealed card - split view
        <>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-16">
            <div className="flex flex-col items-center mb-4">
              <ClickableText text={isTargetOnFront ? card.front : ''} language={targetLanguage}>
                <p className="text-lg font-semibold mb-2">
                  {card.front}
                </p>
              </ClickableText>
              {isTargetOnFront && (
                <div data-menu-area>
                  <TTSButton 
                    text={card.front} 
                    language={targetLanguage}
                    size="sm"
                  />
                </div>
              )}
            </div>
            {(card.exampleSentence || card.exampleSentenceTranslation) && (
              <div className="flex flex-col items-center">
                <ClickableText text={isTargetOnFront ? targetExampleSentence || '' : ''} language={targetLanguage}>
                  <p className="text-base mb-2">
                    {card.exampleSentence}
                  </p>
                </ClickableText>
                {isTargetOnFront && targetExampleSentence && (
                  <div data-menu-area>
                    <TTSButton 
                      text={targetExampleSentence} 
                      language={targetLanguage}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator orientation="horizontal" className="w-auto" />

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="flex flex-col items-center mb-4">
              <ClickableText text={!isTargetOnFront ? card.back : ''} language={targetLanguage}>
                <p className="text-lg font-semibold mb-2">
                  {card.back}
                </p>
              </ClickableText>
              {!isTargetOnFront && (
                <div data-menu-area>
                  <TTSButton 
                    text={card.back} 
                    language={targetLanguage}
                    size="sm"
                  />
                </div>
              )}
            </div>
            {(card.exampleSentence || card.exampleSentenceTranslation) && (
              <div className="flex flex-col items-center">
                <ClickableText text={!isTargetOnFront ? targetExampleSentence || '' : ''} language={targetLanguage}>
                  <p className="text-base mb-2">
                    {card.exampleSentenceTranslation}
                  </p>
                </ClickableText>
                {!isTargetOnFront && targetExampleSentence && (
                  <div data-menu-area>
                    <TTSButton 
                      text={targetExampleSentence} 
                      language={targetLanguage}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}