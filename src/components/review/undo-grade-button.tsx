import { useUndoStack } from '@/components/hooks/query';
import { undoGradeCard } from '@/lib/sync/operation';
import { reviewSession } from '@/lib/review-session';
import { isEventTargetInput } from '@/lib/utils';
import { ArrowCounterClockwise } from 'phosphor-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function UndoGradeButton() {
  const undoStack = useUndoStack();

  const handleUndo = async () => {
    if (undoStack.length === 0) return;
    
    // Get the card that will be undone (top of stack)
    const cardToUndo = undoStack[undoStack.length - 1];
    
    // Perform the undo operation
    const result = await undoGradeCard();
    
    if (result.applied) {
      // Sync with our session state - remove from completed cards
      reviewSession.undoCardCompletion(cardToUndo.cardId);
      
      toast('Undo successful', {
        icon: <ArrowCounterClockwise className='size-4' />,
      });
    }
  };

  useEffect(() => {
    if (undoStack.length === 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // we don't want to hijack the undo in text inputs
      if (isEventTargetInput(event)) {
        return;
      }

      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // length as dependency as the array reference is stable
  }, [undoStack.length]);

  if (undoStack.length === 0) {
    return null;
  }

  return (
    <div
      className='px-2 py-3 cursor-pointer'
      onClick={handleUndo}
    >
      <ArrowCounterClockwise className='size-6 text-muted-foreground/50 hover:text-muted-foreground transition-all' />
    </div>
  );
}
