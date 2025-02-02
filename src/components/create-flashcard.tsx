import { FormTextareaImageUpload } from '@/components/form/form-textarea-image-upload';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  cardContentFormSchema,
  CardContentFormValues,
} from '@/lib/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

type CreateFlashcardFormProps = {
  onSubmit: (values: CardContentFormValues) => void;
};

export function CreateFlashcardForm({ onSubmit }: CreateFlashcardFormProps) {
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
        className='flex flex-col gap-4 bg-background rounded-xl p-4 h-full max-h-80 justify-center'
      >
        <div className='grow'>
          <FormTextareaImageUpload
            className='text-sm border-none shadow-none h-full'
            form={form}
            name='front'
            // label='Question'
            placeholder='Enter the question'
          />
        </div>

        <div className='grow'>
          <FormTextareaImageUpload
            className='text-sm border-none shadow-none h-full'
            form={form}
            name='back'
            // label='Answer'
            placeholder='Enter the answer'
          />
        </div>

        <Button type='submit' size='lg' className='ml-auto bg-cyan-500'>
          Create
        </Button>
      </form>
    </Form>
  );
}
