import { deckFormSchema, DeckFormValues } from '@/lib/form-schema';
import { updateDeckLanguagesOperation, updateDeckOperation } from '@/lib/sync/operation';
import { Deck } from '@/lib/types';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
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
  const form = useForm<DeckFormValues>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      name: deck.name,
      description: deck.description,
      nativeLanguage: deck.nativeLanguage || '',
      targetLanguage: deck.targetLanguage || '',
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

    onOpenChange(false);
    toast.success('Deck updated successfully');
  };

  const getCurrentLanguageName = (languageCode?: string) => {
    if (!languageCode) return undefined;
    return SUPPORTED_LANGUAGES.find(lang => lang.value === languageCode)?.label;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('rounded-2xl max-w-lg')}>
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

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='rounded-lg'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='rounded-lg'
                size={'lg'}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}