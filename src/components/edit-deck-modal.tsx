import { deckFormSchema, DeckFormValues } from '@/lib/form-schema';
import { deleteDeckOperation, updateDeckLanguagesOperation, updateDeckNewCardsPerDayOperation, updateDeckOperation } from '@/lib/sync/operation';
import { Deck } from '@/lib/types';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMediaQuery } from '@uidotdev/usehooks';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { LanguageSelect, SUPPORTED_LANGUAGES } from './ui/language-select';
import { toast } from 'sonner';

interface EditDeckModalProps {
  deck: Deck;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDeckModal({
  deck,
  open,
  onOpenChange,
}: EditDeckModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const form = useForm<DeckFormValues>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      name: deck.name,
      description: deck.description,
      nativeLanguage: deck.nativeLanguage || '',
      targetLanguage: deck.targetLanguage || '',
      newCardsPerDay: deck.newCardsPerDay,
    },
  });

  const handleSubmit = async (data: DeckFormValues) => {
    // Update deck name and description if changed
    if (data.name !== deck.name || data.description !== deck.description) {
      await updateDeckOperation(deck.id, data.name, data.description ?? '');
    }

    // Update languages if changed
    if (
      data.nativeLanguage !== deck.nativeLanguage ||
      data.targetLanguage !== deck.targetLanguage
    ) {
      await updateDeckLanguagesOperation(
        deck.id,
        data.nativeLanguage,
        data.targetLanguage
      );
    }

    // Update new cards per day if changed
    if (data.newCardsPerDay !== deck.newCardsPerDay) {
      await updateDeckNewCardsPerDayOperation(deck.id, data.newCardsPerDay);
    }

    onOpenChange(false);
    toast.success('Deck updated successfully');
  };

  const getCurrentLanguageName = (languageCode?: string) => {
    if (!languageCode) return undefined;
    return SUPPORTED_LANGUAGES.find(lang => lang.value === languageCode)?.label;
  };

  const handleDelete = async () => {
    await deleteDeckOperation(deck.id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
    toast.success('Deck deleted successfully');
  };

  return (
    <>
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the deck "{deck.name}" and all its cards. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(
          'rounded-2xl max-w-lg',
          isMobile && 'fixed bottom-0 left-0 right-0 top-auto max-w-none w-full rounded-t-xl rounded-b-none border-0 p-6 m-0 translate-x-0 translate-y-0'
        )}>
          <DialogHeader>
            <DialogTitle>Edit Deck</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter deck name'
                        className='text-sm'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter deck description'
                        className='resize-none text-sm'
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='nativeLanguage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Native Language</FormLabel>
                      <FormControl>
                        <LanguageSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder='Select native language'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='targetLanguage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Language</FormLabel>
                      <FormControl>
                        <LanguageSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder='Select target language'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='newCardsPerDay'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Cards Per Day</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        max={9999}
                        placeholder='10'
                        className='text-sm'
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show current language selections */}
              <div className='text-xs text-muted-foreground space-y-1'>
                <p>
                  Current native language:{' '}
                  {getCurrentLanguageName(deck.nativeLanguage ?? undefined) || 'Not set'}
                </p>
                <p>
                  Current target language:{' '}
                  {getCurrentLanguageName(deck.targetLanguage ?? undefined) || 'Not set'}
                </p>
              </div>

              <DialogFooter className='flex flex-col sm:flex-row gap-2'>
                <Button
                  type='button'
                  variant='destructive'
                  onClick={() => setShowDeleteConfirm(true)}
                  className='rounded-lg sm:mr-auto'
                >
                  Delete Deck
                </Button>
                <div className='flex gap-2 w-full sm:w-auto'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => onOpenChange(false)}
                    className='rounded-lg flex-1 sm:flex-none'
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    className='rounded-lg flex-1 sm:flex-none'
                    size={'lg'}
                  >
                    Save Changes
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}