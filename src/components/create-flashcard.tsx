import { FormTextareaImageUpload } from '@/components/form/form-textarea-image-upload';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  cardContentFormSchema,
  CardContentFormValues,
} from '@/lib/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Book } from 'lucide-react';
import { useForm } from 'react-hook-form';

type CreateFlashcardFormProps = {
  onSubmit: (values: CardContentFormValues) => void;
  numDecks?: number;
};

export function CreateFlashcardForm({
  onSubmit,
  numDecks,
}: CreateFlashcardFormProps) {
  const form = useForm<CardContentFormValues>({
    resolver: zodResolver(cardContentFormSchema),
    defaultValues: {
      front: '',
      back: '',
    },
  });

  const handleSubmit = (data: CardContentFormValues) => {
    onSubmit(data);
    form.reset();
    form.setFocus('front');
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='flex flex-col gap-4 bg-background rounded-xl p-4 h-full max-h-96 justify-center'
      >
        <div className='grow'>
          <FormTextareaImageUpload
            className='text-sm border-none shadow-none h-32'
            form={form}
            name='front'
            // label='Question'
            placeholder='Enter the question'
          />
        </div>

        <div className='grow'>
          <FormTextareaImageUpload
            className='text-sm border-none shadow-none h-32'
            form={form}
            name='back'
            // label='Answer'
            placeholder='Enter the answer'
          />
        </div>
        <div className='flex justify-start'>
          <div className='flex gap-1 text-muted-foreground justify-center items-center font-semibold ml-2'>
            <Book className='w-5 h-5' />
            <span className='text-sm'>
              {numDecks} {numDecks === 1 ? 'deck' : 'decks'} selected
            </span>
          </div>

          <Button
            type='submit'
            size='lg'
            className='ml-auto self-end'
          >
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
