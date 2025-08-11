import { CreateUpdateFlashcardForm } from '@/components/create-flashcard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CardContentFormValues } from '@/lib/form-schema';
import { CardWithMetadata } from '@/lib/types';

type EditFlashcardDialogProps = {
  onEdit: (values: CardContentFormValues) => void;
  card: CardWithMetadata;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditFlashcardDialog({
  card,
  open,
  onOpenChange,
  onEdit,
}: EditFlashcardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='p-2 pt-6'>
        <DialogHeader className='text-center'>
          <DialogTitle className='text-center text-lg'>Edit Flashcard</DialogTitle>
        </DialogHeader>

        <CreateUpdateFlashcardForm
          onSubmit={onEdit}
          initialFront={card.front}
          initialBack={card.back}
          initialExampleSentence={card.exampleSentence ?? undefined}
          initialExampleSentenceTranslation={card.exampleSentenceTranslation ?? undefined}
        />
      </DialogContent>
    </Dialog>
  );
}
