import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WordSelectionData } from '@/lib/ai/gpt-service';
import { cn } from '@/lib/utils';

interface WordSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: WordSelectionData | null;
  onWordSelected: (word: string) => void;
}

export function WordSelectionDialog({
  open,
  onOpenChange,
  data,
  onWordSelected,
}: WordSelectionDialogProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  if (!data) return null;

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
  };

  const handleConfirm = () => {
    if (selectedWord) {
      onWordSelected(selectedWord);
      onOpenChange(false);
      setSelectedWord(null);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedWord(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Target Word</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <p className="text-sm text-muted-foreground">
            Click on any word in the sentence to select it as your target word for the flashcard.
          </p>

          {/* Sentence with clickable words */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Target Language Sentence:</h3>
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="text-lg leading-relaxed">
                  {data.sentence.split(/(\s+)/).map((part, index) => {
                    const trimmedPart = part.trim();
                    const isWord = /\w/.test(trimmedPart);
                    
                    if (!isWord) {
                      return <span key={index}>{part}</span>;
                    }

                    const isSelected = selectedWord === trimmedPart;
                    const isSelectable = data.words.some(w => w.word === trimmedPart);

                    return (
                      <span
                        key={index}
                        className={cn(
                          "transition-colors duration-200",
                          isSelectable && [
                            "cursor-pointer",
                            "hover:bg-primary/20",
                            "rounded px-1 -mx-1",
                            isSelected && "bg-primary/30 ring-2 ring-primary/50"
                          ]
                        )}
                        onClick={isSelectable ? () => handleWordClick(trimmedPart) : undefined}
                      >
                        {part}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Translation */}
            <div>
              <h3 className="font-medium mb-2">Translation:</h3>
              <div className="p-4 border rounded-lg bg-muted/10">
                <p className="text-lg">{data.sentenceTranslation}</p>
              </div>
            </div>
          </div>

          {/* Selected word display */}
          {selectedWord && (
            <div className="p-4 border rounded-lg bg-primary/5">
              <p className="text-sm text-muted-foreground mb-1">Selected word:</p>
              <p className="text-xl font-semibold text-primary">{selectedWord}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedWord}
              className="min-w-24"
            >
              Create Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}