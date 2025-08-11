import { CreateUpdateFlashcardForm } from '@/components/create-flashcard';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { CardContentFormValues } from '@/lib/form-schema';
import { CardWithMetadata } from '@/lib/types';

type EditFlashcardDrawerProps = {
  onEdit: (values: CardContentFormValues) => void;
  card: CardWithMetadata;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditFlashcardDrawer({
  card,
  open,
  onOpenChange,
  onEdit,
}: EditFlashcardDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='w-full'>
        <DrawerHeader>
          <DrawerTitle>Edit Flashcard</DrawerTitle>
        </DrawerHeader>

        <CreateUpdateFlashcardForm
          onSubmit={onEdit}
          initialFront={card.front}
          initialBack={card.back}
          initialExampleSentence={card.exampleSentence ?? undefined}
          initialExampleSentenceTranslation={card.exampleSentenceTranslation ?? undefined}
        />
      </DrawerContent>
    </Drawer>
  );
}
