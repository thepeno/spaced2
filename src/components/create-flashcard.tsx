import { FormTextareaImageUpload } from '@/components/form/form-textarea-image-upload';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import {
  cardContentFormSchema,
  CardContentFormValues,
  assistedCardFormSchema,
  AssistedCardFormValues,
} from '@/lib/form-schema';
import { isEventTargetInput } from '@/lib/utils';
import VibrationPattern from '@/lib/vibrate';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Wand2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type CreateFlashcardFormProps = {
  onSubmit: (values: CardContentFormValues) => void;
  onAssistedSubmit?: (values: AssistedCardFormValues) => void;
  selectedDeckId?: string;
  initialFront?: string;
  initialBack?: string;
  initialExampleSentence?: string;
  initialExampleSentenceTranslation?: string;
  onImageUpload?: (image: File) => Promise<void>;
  isGenerating?: boolean;
};

const FOCUS_QUESTION_KEY = ' ';

export function CreateUpdateFlashcardForm({
  onSubmit,
  onAssistedSubmit,
  selectedDeckId,
  initialFront,
  initialBack,
  initialExampleSentence,
  initialExampleSentenceTranslation,
  onImageUpload,
  isGenerating = false,
}: CreateFlashcardFormProps) {
  const [assistedMode, setAssistedMode] = useState(false);
  
  const form = useForm<CardContentFormValues>({
    resolver: zodResolver(cardContentFormSchema),
    defaultValues: {
      front: initialFront || '',
      back: initialBack || '',
      exampleSentence: initialExampleSentence || '',
      exampleSentenceTranslation: initialExampleSentenceTranslation || '',
    },
  });

  const assistedForm = useForm<AssistedCardFormValues>({
    resolver: zodResolver(assistedCardFormSchema),
    defaultValues: {
      word: '',
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

  const handleAssistedSubmit = useCallback(
    (data: AssistedCardFormValues) => {
      if (onAssistedSubmit) {
        navigator?.vibrate(VibrationPattern.successConfirm);
        onAssistedSubmit(data);
        assistedForm.reset();
      }
    },
    [assistedForm, onAssistedSubmit]
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

  // Don't show assisted mode for updates
  const showAssistedToggle = !isUpdate;

  return (
    <div className='flex flex-col gap-4 bg-background rounded-xl p-4 h-full justify-center'>
      {showAssistedToggle && (
        <div className='flex items-center space-x-2 mb-4'>
          <Switch
            id='assisted-mode'
            checked={assistedMode}
            onCheckedChange={setAssistedMode}
          />
          <Label htmlFor='assisted-mode' className='flex items-center gap-2'>
            <Wand2 className='w-4 h-4' />
            Assisted creation
          </Label>
        </div>
      )}

      {assistedMode ? (
        <Form {...assistedForm}>
          <form
            onSubmit={assistedForm.handleSubmit(handleAssistedSubmit)}
            className='flex flex-col gap-4 h-full justify-center'
          >
            <div className='grow'>
              <Input
                {...assistedForm.register('word')}
                placeholder='Enter a word to study (e.g., "hello")'
                className='text-lg h-20 text-center'
                disabled={isGenerating}
              />
              {assistedForm.formState.errors.word && (
                <p className='text-sm text-red-500 mt-2'>
                  {assistedForm.formState.errors.word.message}
                </p>
              )}
            </div>
            
            <div className='flex justify-end'>
              <Button
                type='submit'
                size='icon'
                className='rounded-lg'
                disabled={isGenerating || !selectedDeckId}
                title={isGenerating ? 'Generating...' : 'Generate card'}
              >
                <Wand2 className='h-4 w-4' />
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='flex flex-col gap-4 h-full justify-center'
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
        <div className='flex justify-end'>
          <Button
            type='submit'
            size='icon'
            className='rounded-lg'
            disabled={!selectedDeckId}
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
        </form>
      </Form>
      )}
    </div>
  );
}
