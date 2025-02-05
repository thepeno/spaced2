import { FormTextareaImageUpload } from '@/components/form/form-textarea-image-upload';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  cardContentFormSchema,
  CardContentFormValues,
} from '@/lib/form-schema';
import VibrationPattern from '@/lib/vibrate';
import { zodResolver } from '@hookform/resolvers/zod';
import { Book } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type CreateFlashcardFormProps = {
  onSubmit: (values: CardContentFormValues) => void;
  numDecks?: number;
  initialFront?: string;
  initialBack?: string;
};

export function CreateUpdateFlashcardForm({
  onSubmit,
  numDecks,
  initialFront,
  initialBack,
}: CreateFlashcardFormProps) {
  const form = useForm<CardContentFormValues>({
    resolver: zodResolver(cardContentFormSchema),
    defaultValues: {
      front: initialFront || '',
      back: initialBack || '',
    },
  });

  useEffect(() => {
    if (initialFront) {
      form.setValue('front', initialFront);
    }
    if (initialBack) {
      form.setValue('back', initialBack);
    }
  }, [initialFront, initialBack, form]);

  const isUpdate = initialFront || initialBack;

  const handleSubmit = (data: CardContentFormValues) => {
    navigator?.vibrate(VibrationPattern.successConfirm);
    onSubmit(data);
    form.reset();
    form.setFocus('front');
    if (isUpdate) {
      const hasChanged =
        initialFront !== data.front || initialBack !== data.back;
      if (hasChanged) {
        toast.success('Flashcard updated');
      }
    } else {
      toast.success('Flashcard created');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='flex flex-col gap-4 bg-background rounded-xl p-4 h-full justify-center'
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
          {numDecks !== undefined && (
            <div className='flex gap-1 text-muted-foreground justify-center items-center font-semibold ml-2'>
              <Book className='w-5 h-5' />
              <span className='text-sm'>
                {numDecks} {numDecks === 1 ? 'deck' : 'decks'} selected
              </span>
            </div>
          )}

          <Button type='submit' size='lg' className='ml-auto self-end'>
            {isUpdate ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
