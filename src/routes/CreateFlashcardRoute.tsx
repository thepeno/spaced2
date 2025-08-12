import CreateDeckForm from '@/components/create-deck-form';
import { CreateUpdateFlashcardForm } from '@/components/create-flashcard';
import { DeckSelector } from '@/components/deck-selector';
import { useDecks } from '@/components/hooks/query';
import ImageUploadDialog from '@/image-upload-dialog';
import { constructImageMarkdownLink, uploadImage } from '@/lib/files/upload';
import { createNewCard } from '@/lib/sync/operation';
import { generateFlashcard } from '@/lib/ai/gpt-service';
import { AssistedCardFormValues } from '@/lib/form-schema';
import { Image } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';


export default function CreateFlashcardRoute() {
  const decks = useDecks().sort((a, b) => b.lastModified - a.lastModified);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [createDeckDialogOpen, setCreateDeckDialogOpen] = useState(false);
  const [imageUploadDialogOpen, setImageUploadDialogOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
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

  const onImageUpload = async (altText?: string) => {
    if (!imageFile) {
      return;
    }

    const trimmedAltText = altText?.trim();
    setImageUploading(true);
    const result = await uploadImage(imageFile, trimmedAltText);
    setImageUploadDialogOpen(false);

    if (!result.success) {
      toast.error(result.error);
      setImageUploading(false);
      return;
    }

    const imageUrl = constructImageMarkdownLink(result.fileKey, trimmedAltText);
    await navigator.clipboard.writeText(imageUrl);
    toast('Image URL copied to clipboard!', {
      icon: <Image className='w-4 h-4' />,
    });

    // Avoid the flash in the icon change
    await new Promise((resolve) => setTimeout(resolve, 100));
    setImageUploading(false);
    return;
  };

  const onImageUpoadDialogOpenChange = (open: boolean) => {
    setImageUploadDialogOpen(open);
    if (!open) {
      setImageFile(null);
    }
  };

  return (
    <div className='col-span-12 xl:col-start-4 xl:col-end-10 md:px-24 xl:px-0 h-full pb-40'>
      <ImageUploadDialog
        image={imageFile}
        onSubmit={onImageUpload}
        loading={imageUploading}
        open={imageUploadDialogOpen}
        onOpenChange={onImageUpoadDialogOpenChange}
      />

      <CreateDeckForm
        open={createDeckDialogOpen}
        onOpenChange={setCreateDeckDialogOpen}
      />

      <div className='animate-fade-in'>
        <div className='mb-4'>
          <DeckSelector
            decks={decks}
            value={selectedDeckId}
            onValueChange={setSelectedDeckId}
            onCreateNew={() => setCreateDeckDialogOpen(true)}
            placeholder='Select a deck...'
          />
        </div>

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
          isGenerating={isGeneratingCard}
          onImageUpload={async (image) => {
            setImageFile(image);
            setImageUploadDialogOpen(true);
          }}
        />
      </div>
    </div>
  );
}
