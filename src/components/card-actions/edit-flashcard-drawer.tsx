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
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit Flashcard</DrawerTitle>
        </DrawerHeader>
        <DrawerContent className='w-full'>
          <CreateUpdateFlashcardForm
            onSubmit={onEdit}
            initialFront={card.front}
            initialBack={card.back}
          />
        </DrawerContent>
      </DrawerContent>
    </Drawer>
  );
}
