import { Button } from '@/components/ui/button';
import { Plus } from 'phosphor-react';
import CreateDeckForm from '@/components/create-deck-form';
import { useState } from 'react';

export default function NewDeckButton() {
  const [createDeckDialogOpen, setCreateDeckDialogOpen] = useState(false);

  return (
    <>
      <CreateDeckForm
        open={createDeckDialogOpen}
        onOpenChange={setCreateDeckDialogOpen}
      />
      <Button 
        variant="outline" 
        className="w-full h-12 flex items-center justify-center gap-2 shadow-none rounded-[12px]"
        onClick={() => setCreateDeckDialogOpen(true)}
      >
        <Plus className="h-5 w-5 text-primary" />
        <span>New deck</span>
      </Button>
    </>
  );
}