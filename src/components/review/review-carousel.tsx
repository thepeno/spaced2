import FlashcardContent from '@/components/flashcard-content';
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
} from '@/components/ui/carousel';
import { CardWithMetadata } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

function Dots({ current, count }: { current: number; count: number }) {
  return (
    <div className='flex items-center justify-center gap-1'>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'w-2 h-2 rounded-full transition-colors',
            current === index + 1 ? 'bg-primary' : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
}

// Review carousel for mobile view of reviewing flashcards
export default function MobileReviewCarousel({ card }: { card: CardWithMetadata }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(
    function resetCarousel() {
      if (!api) return;
      api.scrollTo(0, true);
    },
    [card, api]
  );

  useEffect(
    function updateCurrent() {
      if (!api) {
        return;
      }

      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);

      api.on('select', () => {
        setCurrent(api.selectedScrollSnap() + 1);
      });
    },
    [api]
  );

  return (
    <div className='flex flex-col items-center gap-2 sm:hidden w-full pt-4'>
      <Dots current={current} count={count} />
      <Carousel className='w-full max-w-md pt-3' setApi={setApi}>
        <CarouselContent>
          <CarouselItem>
            <div className='p-1'>
              <FlashcardContent content={card.front} />
              {card.exampleSentence && (
                <div className='mt-4 p-3 bg-muted/30 rounded-lg border-l-4 border-primary'>
                  <p className='text-sm text-muted-foreground mb-1'>Example:</p>
                  <FlashcardContent content={card.exampleSentence} />
                </div>
              )}
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className='p-1'>
              <FlashcardContent content={card.back} />
              {card.exampleSentenceTranslation && (
                <div className='mt-4 p-3 bg-muted/30 rounded-lg border-l-4 border-secondary'>
                  <p className='text-sm text-muted-foreground mb-1'>Example translation:</p>
                  <FlashcardContent content={card.exampleSentenceTranslation} />
                </div>
              )}
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
}
