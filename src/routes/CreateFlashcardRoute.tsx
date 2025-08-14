import CreateDeckForm from '@/components/create-deck-form';
import { CreateUpdateFlashcardForm } from '@/components/create-flashcard';
import { useDecks } from '@/components/hooks/query';
import { createNewCard } from '@/lib/sync/operation';
import { generateFlashcard } from '@/lib/ai/gpt-service';
import { AssistedCardFormValues } from '@/lib/form-schema';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router';


export default function CreateFlashcardRoute() {
  const decks = useDecks().sort((a, b) => b.lastModified - a.lastModified);
  const [searchParams] = useSearchParams();
  const preselectedDeckId = searchParams.get('deck');
  
  const [selectedDeckId, setSelectedDeckId] = useState<string>(() => {
    if (preselectedDeckId) {
      return preselectedDeckId;
    }
    const saved = localStorage.getItem('flashcard-selected-deck');
    return saved || '';
  });
  const [createDeckDialogOpen, setCreateDeckDialogOpen] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  // Get language settings from selected deck
  const getLanguageSettings = () => {
    if (!selectedDeckId) {
      return { nativeLanguage: 'English', targetLanguage: 'Spanish' };
    }

    const selectedDeck = decks.find(deck => deck.id === selectedDeckId);
    return {
      nativeLanguage: selectedDeck?.nativeLanguage || 'English',
      targetLanguage: selectedDeck?.targetLanguage || 'Spanish'
    };
  };

  // Save selected deck to localStorage
  useEffect(() => {
    if (selectedDeckId) {
      localStorage.setItem('flashcard-selected-deck', selectedDeckId);
    }
  }, [selectedDeckId]);

  const handleAssistedSubmit = async (values: AssistedCardFormValues) => {
    if (!selectedDeckId) {
      toast.error('Please select a deck');
      return;
    }

    setIsGeneratingCard(true);
    toast('Generating flashcard...', {
      description: 'AI is creating your flashcard with examples',
      duration: 2000,
    });

    try {
      const { nativeLanguage, targetLanguage } = getLanguageSettings();
      const generatedCard = await generateFlashcard({
        word: values.word,
        nativeLanguage,
        targetLanguage,
      });

      await createNewCard(
        generatedCard.front,
        generatedCard.back,
        [selectedDeckId],
        generatedCard.exampleSentence,
        generatedCard.exampleSentenceTranslation
      );

      toast.success('Flashcard generated successfully!', {
        description: 'Your AI-generated flashcard has been created',
      });
    } catch (error) {
      console.error('Error generating flashcard:', error);
      toast.error('Failed to generate flashcard', {
        description: 'Please try again or create manually',
      });
    } finally {
      setIsGeneratingCard(false);
    }
  };


  return (
    <div className='grow h-full flex flex-col md:justify-center md:items-center'>
      <div className='w-full flex-1 md:flex-none md:h-auto md:max-w-xl flex flex-col'>
        <CreateDeckForm
          open={createDeckDialogOpen}
          onOpenChange={setCreateDeckDialogOpen}
        />
        <div className='animate-fade-in flex-1 flex flex-col'>
          <CreateUpdateFlashcardForm
            onSubmit={async (values) => {
              if (!selectedDeckId) {
                toast.error('Please select a deck');
                return;
              }
              await createNewCard(
                values.front,
                values.back,
                [selectedDeckId],
                values.exampleSentence || null,
                values.exampleSentenceTranslation || null
              );
            }}
            onAssistedSubmit={handleAssistedSubmit}
            selectedDeckId={selectedDeckId}
            onDeckChange={setSelectedDeckId}
            decks={decks.map(deck => ({
            id: deck.id,
            name: deck.name,
            description: deck.description,
            nativeLanguage: deck.nativeLanguage,
            targetLanguage: deck.targetLanguage
          }))}
            onCreateDeck={() => setCreateDeckDialogOpen(true)}
            isGenerating={isGeneratingCard}
          />
        </div>
      </div>
    </div>
  );
}
