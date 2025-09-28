import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TTSButton } from '@/components/tts/tts-button';
import { ClickableText } from '@/components/tts/clickable-text';
import { CardWithMetadata } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Pencil, Trash } from 'phosphor-react';

type ViewFlashcardDialogProps = {
  card: CardWithMetadata;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  targetLanguage?: string | null;
  nativeLanguage?: string | null;
};

export default function ViewFlashcardDialog({
  card,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  targetLanguage,
}: ViewFlashcardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='p-4 pt-6 max-w-lg'>
        <DialogHeader className='text-center mb-4'>
          <DialogTitle className='text-center text-lg pr-20'>Flashcard</DialogTitle>
          <div className="absolute right-2 top-2 flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                title="Edit card"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/80"
                onClick={() => {
                  onDelete();
                  onOpenChange(false);
                }}
                title="Delete card"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Target word section */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Target word</div>
            <div className="flex items-center gap-2">
              <ClickableText text={card.front} language={targetLanguage} className="flex-1">
                <div className="text-lg font-semibold">{card.front}</div>
              </ClickableText>
              <TTSButton 
                text={card.front} 
                language={targetLanguage}
                size="sm"
              />
            </div>
          </div>

          <Separator />

          {/* Translation section */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Translation</div>
            <div className="text-lg">{card.back}</div>
          </div>

          {card.exampleSentence && (
            <>
              <Separator />
              
              {/* Example sentence section */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Example sentence</div>
                <div className="flex items-start gap-2">
                  <ClickableText text={card.exampleSentence} language={targetLanguage} className="flex-1">
                    <div>{card.exampleSentence}</div>
                  </ClickableText>
                  <TTSButton 
                    text={card.exampleSentence} 
                    language={targetLanguage}
                    size="sm"
                  />
                </div>
              </div>
            </>
          )}

          {card.exampleSentenceTranslation && (
            <>
              <Separator />
              
              {/* Example translation section */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Example translation</div>
                <div>{card.exampleSentenceTranslation}</div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}