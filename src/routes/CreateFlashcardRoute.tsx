import CreateDeckForm from '@/components/create-deck-form';
import { CreateUpdateFlashcardForm } from '@/components/create-flashcard';
import { useDecks } from '@/components/hooks/query';
import { createNewCard } from '@/lib/sync/operation';
import { 
  generateFlashcard, 
  analyzeInput, 
  generateMultipleFlashcards,
  prepareSentenceForWordSelection,
  analyzeWordForArticle,
  WordSelectionData 
} from '@/lib/ai/gpt-service';
import { AssistedCardFormValues } from '@/lib/form-schema';
import { shouldCreateBidirectionalCards } from '@/lib/card-settings';
import { WordSelectionDialog } from '@/components/word-selection-dialog';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router';


export default function CreateFlashcardRoute() {
  const decks = useDecks().sort((a, b) => b.lastModified - a.lastModified);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [wordSelectionData, setWordSelectionData] = useState<WordSelectionData | null>(null);
  const [wordSelectionOpen, setWordSelectionOpen] = useState(false);

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

  // Validate selectedDeckId exists in actual decks list
  useEffect(() => {
    if (selectedDeckId && decks.length > 0) {
      const deckExists = decks.find(deck => deck.id === selectedDeckId);
      if (!deckExists) {
        setSelectedDeckId('');
        localStorage.removeItem('flashcard-selected-deck');
      }
    } else if (selectedDeckId && decks.length === 0) {
      // If no decks exist but we have a selectedDeckId, clear it
      setSelectedDeckId('');
      localStorage.removeItem('flashcard-selected-deck');
    }
  }, [decks, selectedDeckId]);

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

    const { nativeLanguage, targetLanguage } = getLanguageSettings();
    
    setIsGeneratingCard(true);

    try {
      // First, analyze the input to determine the approach
      const analysis = await analyzeInput(values.word);
      
      switch (analysis.type) {
        case 'word-list':
          await handleWordList(analysis.words!, nativeLanguage, targetLanguage);
          break;
          
        case 'sentence':
          await handleSentence(analysis.sentence!, nativeLanguage, targetLanguage);
          break;
          
        case 'single-word':
        default:
          toast('Generating flashcard...', {
            description: 'AI is creating your flashcard with examples',
            duration: 2000,
          });
          await handleSingleWord(values.word, nativeLanguage, targetLanguage);
          break;
      }
    } catch (error) {
      console.error('Error generating flashcard:', error);
      toast.error('Failed to generate flashcard', {
        description: 'Please try again or create manually',
      });
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleWordList = async (words: string[], nativeLanguage: string, targetLanguage: string) => {
    toast('Generating multiple flashcards...', {
      description: `Creating flashcards for ${words.length} words`,
      duration: 3000,
    });

    const cards = await generateMultipleFlashcards(words, nativeLanguage, targetLanguage);
    
    for (const card of cards) {
      await createNewCard(
        card.front,
        card.back,
        [selectedDeckId],
        card.exampleSentence,
        card.exampleSentenceTranslation,
        true, // shouldPregenerateTTS
        shouldCreateBidirectionalCards() // createReverse
      );
    }

    const isBidirectional = shouldCreateBidirectionalCards();
    const totalCards = isBidirectional ? cards.length * 2 : cards.length;
    
    toast.success(`${cards.length} flashcards generated successfully!`, {
      description: `Created ${totalCards} total cards${isBidirectional ? ' (both directions)' : ''}`,
    });
  };

  const handleSentence = async (sentence: string, nativeLanguage: string, targetLanguage: string) => {
    toast('Preparing sentence for word selection...', {
      description: 'Analyzing sentence structure',
      duration: 2000,
    });

    const selectionData = await prepareSentenceForWordSelection(sentence, nativeLanguage, targetLanguage);
    setWordSelectionData(selectionData);
    setWordSelectionOpen(true);
  };


  const handleSingleWord = async (word: string, nativeLanguage: string, targetLanguage: string) => {
    // Make both API calls simultaneously
    const [generatedCard, articleAnalysis] = await Promise.all([
      generateFlashcard({
        word,
        nativeLanguage,
        targetLanguage,
      }),
      analyzeWordForArticle(word, targetLanguage)
    ]);

    // Use the GPT-analyzed article if it's a noun, otherwise use the generated card as-is
    let finalFront = generatedCard.front;
    if (articleAnalysis.isNoun && articleAnalysis.wordWithArticle) {
      finalFront = articleAnalysis.wordWithArticle;
    }

    const cardId = await createNewCard(
      finalFront,
      generatedCard.back,
      [selectedDeckId],
      generatedCard.exampleSentence,
      generatedCard.exampleSentenceTranslation,
      true, // shouldPregenerateTTS
      shouldCreateBidirectionalCards() // createReverse
    );

    const isBidirectional = shouldCreateBidirectionalCards();
    toast.success('Flashcard generated successfully!', {
      description: isBidirectional
        ? 'Your AI-generated flashcards (both directions) have been created'
        : 'Your AI-generated flashcard has been created',
      action: {
        label: 'Edit',
        onClick: () => navigate(`/decks/${selectedDeckId}/browse?edit=${cardId}`)
      }
    });
  };

  const handleWordSelection = async (selectedWord: string) => {
    if (!wordSelectionData || !selectedDeckId) return;

    setIsGeneratingCard(true);
    try {
      const { nativeLanguage, targetLanguage } = getLanguageSettings();
      
      // Make both API calls simultaneously
      const [generatedCard, articleAnalysis] = await Promise.all([
        generateFlashcard({
          word: selectedWord,
          nativeLanguage,
          targetLanguage,
          mode: 'sentence',
          context: wordSelectionData.sentence
        }),
        analyzeWordForArticle(selectedWord, targetLanguage, wordSelectionData.sentence)
      ]);

      // Use the GPT-analyzed article if it's a noun, otherwise use the generated card as-is
      let finalFront = generatedCard.front;
      if (articleAnalysis.isNoun && articleAnalysis.wordWithArticle) {
        finalFront = articleAnalysis.wordWithArticle;
      }

      // Use the original sentence as the example
      const cardId = await createNewCard(
        finalFront,
        generatedCard.back,
        [selectedDeckId],
        wordSelectionData.sentence,
        wordSelectionData.sentenceTranslation,
        true, // shouldPregenerateTTS
        shouldCreateBidirectionalCards() // createReverse
      );

      const isBidirectional = shouldCreateBidirectionalCards();
      toast.success('Flashcard created from sentence!', {
        description: isBidirectional
          ? 'Flashcards (both directions) created with your sentence as example'
          : 'Flashcard created with your sentence as example',
        action: {
          label: 'Edit',
          onClick: () => navigate(`/decks/${selectedDeckId}/browse?edit=${cardId}`)
        }
      });
    } catch (error) {
      console.error('Error creating flashcard from sentence:', error);
      toast.error('Failed to create flashcard');
    } finally {
      setIsGeneratingCard(false);
      setWordSelectionData(null);
    }
  };


  return (
    <div className='grow h-full flex flex-col md:justify-center md:items-center px-5 pb-2 pt-6'>
      <div className='w-full flex-1 md:flex-none md:h-auto md:max-w-xl flex flex-col'>
        <CreateDeckForm
          open={createDeckDialogOpen}
          onOpenChange={setCreateDeckDialogOpen}
          onSuccess={(newDeckId) => {
            setSelectedDeckId(newDeckId);
            localStorage.setItem('flashcard-selected-deck', newDeckId);
          }}
        />
        <div className='flex-1 flex flex-col'>
          <CreateUpdateFlashcardForm
            onSubmit={async (values) => {
              if (!selectedDeckId) {
                toast.error('Please select a deck');
                return;
              }
              const cardId = await createNewCard(
                values.front,
                values.back,
                [selectedDeckId],
                values.exampleSentence || null,
                values.exampleSentenceTranslation || null,
                true, // shouldPregenerateTTS
                shouldCreateBidirectionalCards() // createReverse
              );

              const isBidirectional = shouldCreateBidirectionalCards();
              toast.success('Flashcard created!', {
                description: isBidirectional
                  ? 'Flashcards (both directions) have been created'
                  : 'Your flashcard has been created',
                action: {
                  label: 'Edit',
                  onClick: () => navigate(`/decks/${selectedDeckId}/browse?edit=${cardId}`)
                }
              });
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
      
      <WordSelectionDialog
        open={wordSelectionOpen}
        onOpenChange={setWordSelectionOpen}
        data={wordSelectionData}
        onWordSelected={handleWordSelection}
      />
    </div>
  );
}
