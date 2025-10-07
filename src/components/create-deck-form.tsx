import { deckFormSchema, DeckFormValues } from '@/lib/form-schema';
import { createNewDeck } from '@/lib/sync/operation';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { LanguageSelect } from './ui/language-select';
import { toast } from 'sonner';

export default function CreateDeckForm({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (deckId: string) => void;
}) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const form = useForm<DeckFormValues>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      name: '',
      description: '',
      nativeLanguage: '',
      targetLanguage: '',
      newCardsPerDay: 10,
    },
  });

  const handleSubmit = async (data: DeckFormValues) => {
    const newDeckId = await createNewDeck(
      data.name, 
      data.description ?? '', 
      data.nativeLanguage || null, 
      data.targetLanguage || null
    );
    onOpenChange(false);
    form.reset();

    toast.success('New deck created');
    
    if (onSuccess) {
      onSuccess(newDeckId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        'rounded-2xl',
        isMobile && 'fixed bottom-0 left-0 right-0 top-auto max-w-none w-full rounded-t-xl rounded-b-none border-0 p-6 m-0 translate-x-0 translate-y-0'
      )}>
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
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

            <DialogFooter>
              <Button
                type='submit'
                className='rounded-lg'
                size={'lg'}
              >
                Create Deck
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
