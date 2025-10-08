import { FormTextarea } from '@/components/form/form-textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form } from '@/components/ui/form';
import { DeckSelector } from '@/components/deck-selector';
import {
  cardContentFormSchema,
  CardContentFormValues,
  assistedCardFormSchema,
  AssistedCardFormValues,
} from '@/lib/form-schema';
import { cn, isEventTargetInput } from '@/lib/utils';
import VibrationPattern from '@/lib/vibrate';
import { zodResolver } from '@hookform/resolvers/zod';
import { MagicWand, Microphone } from 'phosphor-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { shouldCreateBidirectionalCards } from '@/lib/card-settings';

// Speech Recognition API types
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

type CreateFlashcardFormProps = {
  onSubmit: (values: CardContentFormValues) => void;
  onAssistedSubmit?: (values: AssistedCardFormValues) => void;
  selectedDeckId?: string;
  onDeckChange?: (deckId: string) => void;
  decks?: Array<{
    id: string;
    name: string;
    description: string;
    nativeLanguage: string | null;
    targetLanguage: string | null;
  }>;
  onCreateDeck?: () => void;
  initialFront?: string;
  initialBack?: string;
  initialExampleSentence?: string;
  initialExampleSentenceTranslation?: string;
  onImageUpload?: (image: File) => Promise<void>;
  isGenerating?: boolean;
};

const FOCUS_QUESTION_KEY = ' ';

export function   CreateUpdateFlashcardForm({
  onSubmit,
  onAssistedSubmit,
  selectedDeckId,
  onDeckChange,
  decks = [],
  onCreateDeck,
  initialFront,
  initialBack,
  initialExampleSentence,
  initialExampleSentenceTranslation,
  isGenerating = false,
}: CreateFlashcardFormProps) {
  const isUpdate = Boolean(initialFront || initialBack);

  const [assistedMode, setAssistedMode] = useState(() => {
    // Never use assisted mode for updates/edits
    if (isUpdate) return false;

    const saved = localStorage.getItem('flashcard-assisted-mode');
    return saved !== null ? JSON.parse(saved) : true; // Default to true (assisted mode)
  });
  const [isListening, setIsListening] = useState(false);
  const [textareaRows, setTextareaRows] = useState(1);
  const [maxHeight, setMaxHeight] = useState(0);
  const parentRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = useCallback(
    (data: CardContentFormValues) => {
      // Block submission if no deck selected and not updating
      if (!isUpdate && !selectedDeckId) {
        toast.error('Please select a deck first');
        return;
      }
      
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
        const isBidirectional = shouldCreateBidirectionalCards();
        toast.success(isBidirectional ? 'Flashcards created' : 'Flashcard created');
      }
    },
    [form, isUpdate, initialFront, initialBack, initialExampleSentence, initialExampleSentenceTranslation, onSubmit, selectedDeckId]
  );

  const handleAssistedSubmit = useCallback(
    (data: AssistedCardFormValues) => {
      // Block submission if no deck selected or deck doesn't exist
      if (!selectedDeckId || !decks.find(deck => deck.id === selectedDeckId)) {
        toast.error('Please select a deck first');
        return;
      }
      
      if (onAssistedSubmit) {
        navigator?.vibrate(VibrationPattern.successConfirm);
        onAssistedSubmit(data);
        assistedForm.reset();
      }
    },
    [assistedForm, onAssistedSubmit, selectedDeckId, decks]
  );

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    assistedForm.setValue('word', value);

    // Calculate number of lines based on newlines + 1
    const lines = value.split('\n').length;
    setTextareaRows(Math.max(1, lines));
  }, [assistedForm]);

  const handleDictation = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      assistedForm.setValue('word', transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Speech recognition failed');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [assistedForm, isListening]);

  // Save assisted mode preference to localStorage (only for creation, not edits)
  useEffect(() => {
    if (!isUpdate) {
      localStorage.setItem('flashcard-assisted-mode', JSON.stringify(assistedMode));
    }
  }, [assistedMode, isUpdate]);

  useEffect(() => {
    const updateMaxHeight = () => {
      if (parentRef.current) {
        const parentHeight = parentRef.current.clientHeight;
        // Use 80% of parent height to leave some room for centering
        setMaxHeight(parentHeight);
      }
    };

    updateMaxHeight();
    window.addEventListener('resize', updateMaxHeight);

    return () => window.removeEventListener('resize', updateMaxHeight);
  }, [assistedMode]);

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
        // Don't submit if no deck is selected and not updating
        if (!isUpdate && !selectedDeckId) {
          event.preventDefault();
          return;
        }
        
        form.handleSubmit(handleSubmit)();
        form.setFocus('front');
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form, handleSubmit, isUpdate, selectedDeckId]);

  // Don't show assisted mode for updates
  const showAssistedToggle = !isUpdate;

  return (
    <div className='flex flex-col grow gap-8 rounded-xl h-full'>
      {showAssistedToggle && (
        <div className='flex align-middle justify-between space-x-2'>
          <Label htmlFor='assisted-mode' className='flex items-center gap-2'>
            <MagicWand className='w-4 h-4' />
            Assisted creation
          </Label>
          <Switch
            id='assisted-mode'
            size='lg'
            checked={assistedMode}
            onCheckedChange={setAssistedMode}
          />
        </div>
      )}

      {assistedMode && !isUpdate ? (
        <Form {...assistedForm}>
          <form
            onSubmit={assistedForm.handleSubmit(handleAssistedSubmit)}
            className='flex flex-col grow gap-4 h-full justify-center'
          >
            <div className='flex flex-col grow h-full relative justify-center md:min-h-[228px]' ref={parentRef}>
              <div
                style={{ maxHeight: maxHeight ? `${maxHeight}px` : 'none' }}
                className='overflow-y-auto'
              >
                <Textarea
                  {...assistedForm.register('word')}
                  placeholder='Enter a word to study (e.g., "hello")'
                  className='w-full text-lg text-center shadow-none border-none focus:outline-none focus-visible:ring-0 resize-none pb-10'
                  disabled={isGenerating}
                  rows={textareaRows}
                  onChange={handleTextChange}
                />
              </div>
              <Button
                type='button'
                variant='outline'
                className='absolute bottom-4 right-0 h-[60px] w-[60px] min-w-[60px] flex-shrink-0 inline-flex items-center justify-center rounded-[12px] shadow-none'
                onClick={handleDictation}
                disabled={isGenerating}
                title={isListening ? 'Stop dictation' : 'Start dictation'}
              >
                <Microphone className={`h-[22.5px] w-[22.5px] ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
              </Button>
              {assistedForm.formState.errors.word && (
                <p className='text-sm text-red-500 mt-2'>
                  {assistedForm.formState.errors.word.message}
                </p>
              )}
            </div>

            <div className='flex gap-2 items-center'>
              {onDeckChange && onCreateDeck && (
                <DeckSelector
                  decks={decks}
                  value={selectedDeckId || ''}
                  onValueChange={onDeckChange}
                  onCreateNew={onCreateDeck}
                  placeholder='Select a deck...'
                  className='flex-1'
                />
              )}
              <Button
                type='submit'
                variant='outline'
                className='h-[60px] w-[60px] min-w-[60px] flex-shrink-0 inline-flex items-center justify-center rounded-[12px] shadow-none'
                disabled={isGenerating || !selectedDeckId || !decks.find(deck => deck.id === selectedDeckId)}
                title={isGenerating ? 'Generating...' : 'Generate card'}
              >
                <MagicWand className='h-7.5 w-7.5 text-primary' />
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='flex flex-col grow gap-3 h-full overflow-y-auto'
          >
            <FormTextarea
              resizable={false}
              className='text-sm shadow-none bg-background h-10'
              form={form}
              name='front'
              label={isUpdate ? 'Target word' : ''}
              placeholder='Input target word'
            />
            <FormTextarea
              resizable={false}
              className='text-sm shadow-none bg-background h-10'
              form={form}
              name='back'
              label={isUpdate ? 'Translation' : ''}
              placeholder='Input translation'
            />
            <FormTextarea
              resizable={false}
              grow
              className='text-sm grow shadow-none bg-background h-full'
              form={form}
              name='exampleSentence'
              label={isUpdate ? 'Example sentence' : ''}
              placeholder='Example sentence'
            />
            <FormTextarea
              resizable={false}
              grow
              className='text-sm grow shadow-none bg-background h-full'
              form={form}
              name='exampleSentenceTranslation'
              label={isUpdate ? 'Example translation' : ''}
              placeholder='Translation of example sentence'
            />
            <div className={cn('flex gap-2 items-center',
              isUpdate && 'justify-center'
            )}>
              {onDeckChange && onCreateDeck && (
                <DeckSelector
                  decks={decks}
                  value={selectedDeckId || ''}
                  onValueChange={onDeckChange}
                  onCreateNew={onCreateDeck}
                  placeholder='Select a deck...'
                  className='flex-1'
                />
              )}
              <Button
                type='submit'
                variant='outline'
                className={cn('h-[60px] px-6 flex-shrink-0 inline-flex items-center justify-center rounded-[12px] shadow-none text-primary',
                  isUpdate && 'h-fit mt-3 self-end'
                )}
                disabled={!isUpdate && (!selectedDeckId || !decks.find(deck => deck.id === selectedDeckId))}
              >
                {isUpdate ? 'Save' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
