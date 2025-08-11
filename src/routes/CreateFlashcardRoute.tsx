import BouncyButton from '@/components/bouncy-button';
import CreateDeckForm from '@/components/create-deck-form';
import { CreateUpdateFlashcardForm } from '@/components/create-flashcard';
import { useDecks } from '@/components/hooks/query';
import SearchBar from '@/components/search-bar';
import { Card } from '@/components/ui/card';
import ImageUploadDialog from '@/image-upload-dialog';
import { constructImageMarkdownLink, uploadImage } from '@/lib/files/upload';
import { createNewCard } from '@/lib/sync/operation';
import { cn } from '@/lib/utils';
import VibrationPattern from '@/lib/vibrate';
import { CircleCheck, CirclePlus, Image } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function DeckSelectionCard({
  title,
  backgroundType,
  onSelect,
  selected,
}: {
  title: string;
  backgroundType: 'cool-mint' | 'cyan' | 'plate-armor' | 'plain' | 'gunmetal';
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <BouncyButton variant='medium'>
      <Card
        className={cn(
          'h-40 w-32 relative cursor-pointer border-3 border-background',
          backgroundType === 'cool-mint'
            ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
            : backgroundType === 'cyan'
            ? 'bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-400'
            : backgroundType === 'plate-armor'
            ? 'bg-gradient-to-br from-gray-300 via-gray-500 to-gray-700'
            : backgroundType === 'gunmetal'
            ? 'bg-linear-to-r from-gray-800 via-blue-700 to-gray-900'
            : 'bg-muted-foreground'
        )}
        onClick={onSelect}
      >
        <div className='absolute top-2 left-2'>
          <CircleCheck
            className={cn(
              selected ? 'text-white' : 'text-transparent',
              'h-6 w-6',
              selected && 'animate-scale'
            )}
          />
        </div>
        <h2 className='absolute bottom-4 right-3 text-white text-md font-semibold max-w-24 text-right'>
          {title}
        </h2>
      </Card>
    </BouncyButton>
  );
}

function CreateNewDeckCard({ onClick }: { onClick: () => void }) {
  return (
    <BouncyButton variant='medium'>
      <Card
        className={cn(
          'h-40 w-32 relative cursor-pointer border-3 border-background',
          'bg-gradient-to-br from-cyan-500 via-blue-400 to-indigo-400'
        )}
        onClick={onClick}
      >
        <div className='absolute top-2 left-2'>
          <CirclePlus className='h-6 w-6 text-white' />
        </div>
        <h2 className='absolute bottom-4 right-3 text-white text-md font-semibold max-w-24 text-right'>
          Create
          <br />
          New Deck
        </h2>
      </Card>
    </BouncyButton>
  );
}

export default function CreateFlashcardRoute() {
  const [search, setSearch] = useState('');

  const decks = useDecks().sort((a, b) => b.lastModified - a.lastModified);
  const shownDecks = decks.filter((deck) =>
    (deck.name.toLowerCase() + deck.description.toLowerCase()).includes(
      search.trim().toLowerCase()
    )
  );
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const [createDeckDialogOpen, setCreateDeckDialogOpen] = useState(false);
  const [imageUploadDialogOpen, setImageUploadDialogOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

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

      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder='Filter decks...'
        onEnter={() => {
          const selectedDeck = shownDecks[0];
          if (!selectedDeck) {
            return;
          }

          const isSelected = selectedDecks.includes(selectedDeck.id);
          if (isSelected) {
            setSelectedDecks(
              selectedDecks.filter((id) => id !== selectedDeck.id)
            );
          } else {
            setSelectedDecks([...selectedDecks, selectedDeck.id]);
          }
        }}
      />
      <div className='animate-fade-in'>
        <CreateDeckForm
          open={createDeckDialogOpen}
          onOpenChange={setCreateDeckDialogOpen}
        />

        <div className='flex gap-4 overflow-x-scroll mb-2 bg-background p-4 rounded-xl h-48'>
          {search.trim() === '' && (
            <CreateNewDeckCard
              onClick={() => {
                setCreateDeckDialogOpen(true);
              }}
            />
          )}

          {shownDecks.map((deck) => {
            const selected = selectedDecks.includes(deck.id);
            return (
              <DeckSelectionCard
                key={deck.id}
                title={deck.name}
                backgroundType={selected ? 'cool-mint' : 'plain'}
                selected={selected}
                onSelect={() => {
                  navigator?.vibrate(VibrationPattern.buttonTap);
                  if (selected) {
                    setSelectedDecks(
                      selectedDecks.filter((id) => id !== deck.id)
                    );
                  } else {
                    setSelectedDecks([...selectedDecks, deck.id]);
                  }
                }}
              />
            );
          })}

          {shownDecks.length === 0 && search.trim() !== '' && (
            <div className='flex items-center justify-center h-full w-full'>
              <p className='text-muted-foreground'>No decks found</p>
            </div>
          )}
        </div>

        <CreateUpdateFlashcardForm
          onSubmit={async (values) => {
            await createNewCard(
              values.front, 
              values.back, 
              selectedDecks,
              values.exampleSentence || null,
              values.exampleSentenceTranslation || null
            );
          }}
          numDecks={selectedDecks.length}
          onImageUpload={async (image) => {
            setImageFile(image);
            setImageUploadDialogOpen(true);
          }}
        />
      </div>
    </div>
  );
}
