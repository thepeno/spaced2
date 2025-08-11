import { FormTextareaImageUpload } from '@/components/form/form-textarea-image-upload';
import CmdEnterIcon from '@/components/keyboard/CmdEnterIcon';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  cardContentFormSchema,
  CardContentFormValues,
} from '@/lib/form-schema';
import { isEventTargetInput } from '@/lib/utils';
import VibrationPattern from '@/lib/vibrate';
import { zodResolver } from '@hookform/resolvers/zod';
import { Book } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type CreateFlashcardFormProps = {
  onSubmit: (values: CardContentFormValues) => void;
  numDecks?: number;
  initialFront?: string;
  initialBack?: string;
  initialExampleSentence?: string;
  initialExampleSentenceTranslation?: string;
  onImageUpload?: (image: File) => Promise<void>;
};

const FOCUS_QUESTION_KEY = ' ';

export function CreateUpdateFlashcardForm({
  onSubmit,
  numDecks,
  initialFront,
  initialBack,
  initialExampleSentence,
  initialExampleSentenceTranslation,
  onImageUpload,
}: CreateFlashcardFormProps) {
  const form = useForm<CardContentFormValues>({
    resolver: zodResolver(cardContentFormSchema),
    defaultValues: {
      front: initialFront || '',
      back: initialBack || '',
      exampleSentence: initialExampleSentence || '',
      exampleSentenceTranslation: initialExampleSentenceTranslation || '',
    },
  });

  useEffect(() => {
    if (initialFront) {
      form.setValue('front', initialFront);
    }
    if (initialBack) {
      form.setValue('back', initialBack);
    }
    if (initialExampleSentence) {
      form.setValue('exampleSentence', initialExampleSentence);
    }
    if (initialExampleSentenceTranslation) {
      form.setValue('exampleSentenceTranslation', initialExampleSentenceTranslation);
    }
  }, [initialFront, initialBack, initialExampleSentence, initialExampleSentenceTranslation, form]);

  const isUpdate = initialFront || initialBack;
  const handleSubmit = useCallback(
    (data: CardContentFormValues) => {
      navigator?.vibrate(VibrationPattern.successConfirm);
      onSubmit(data);
      form.reset();
      form.setFocus('front');
      if (isUpdate) {
        const hasChanged =
          initialFront !== data.front || 
          initialBack !== data.back ||
          initialExampleSentence !== data.exampleSentence ||
          initialExampleSentenceTranslation !== data.exampleSentenceTranslation;
        if (hasChanged) {
          toast.success('Flashcard updated');
        }
      } else {
        toast.success('Flashcard created');
      }
    },
    [form, isUpdate, initialFront, initialBack, initialExampleSentence, initialExampleSentenceTranslation, onSubmit]
  );

  useEffect(() => {
    // cmd enter to submit
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isEventTargetInput(event)) {
        if (event.key === FOCUS_QUESTION_KEY) {
          form.setFocus('front');
          event.preventDefault();
        }
        return;
      }
      if (event.metaKey && event.key === 'Enter') {
        form.handleSubmit(handleSubmit)();
        form.setFocus('front');
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form, handleSubmit]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='flex flex-col gap-4 bg-background rounded-xl p-4 h-full justify-center'
      >
        <div className='grow'>
          <FormTextareaImageUpload
            onUploadImage={onImageUpload}
            className='text-sm border-none shadow-none h-28'
            form={form}
            name='front'
            // label='Question'
            placeholder='Enter the question'
          />
        </div>

        <div className='grow'>
          <FormTextareaImageUpload
            className='text-sm border-none shadow-none h-28'
            form={form}
            name='back'
            // label='Answer'
            placeholder='Enter the answer'
          />
        </div>

        <div className='grow'>
          <FormTextareaImageUpload
            className='text-sm border-none shadow-none h-24'
            form={form}
            name='exampleSentence'
            // label='Example Sentence'
            placeholder='Example sentence (optional)'
          />
        </div>

        <div className='grow'>
          <FormTextareaImageUpload
            className='text-sm border-none shadow-none h-24'
            form={form}
            name='exampleSentenceTranslation'
            // label='Example Translation'
            placeholder='Translation of example sentence (optional)'
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

          <Button
            type='submit'
            size='lg'
            className='ml-auto self-end rounded-lg [&_svg]:size-3'
          >
            {isUpdate ? 'Update' : 'Create'}

            <CmdEnterIcon />
          </Button>
        </div>
      </form>
    </Form>
  );
}
