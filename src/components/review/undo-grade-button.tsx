import { useUndoStack } from '@/components/hooks/query';
import { undoGradeCard } from '@/lib/sync/operation';
import { isEventTargetInput } from '@/lib/utils';
import { Redo2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function UndoGradeButton() {
  const undoStack = useUndoStack();

  useEffect(() => {
    if (undoStack.length === 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // we don't want to hijack the undo in text inputs
      if (isEventTargetInput(event)) {
        return;
      }

      console.log('event', event);
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        undoGradeCard();
        toast('Undo successful', {
          icon: <Redo2 className='size-4' />,
        });
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
      onClick={() => {
        undoGradeCard();
        toast('Undo successful', {
          icon: <Redo2 className='size-4' />,
        });
      }}
    >
      <Redo2 className='size-6 text-muted-foreground/50 hover:text-muted-foreground transition-all rotate-180' />
    </div>
  );
}
