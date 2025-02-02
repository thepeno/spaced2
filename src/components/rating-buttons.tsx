import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { intlFormatDistance } from 'date-fns';
import { useEffect } from 'react';
import { Card, FSRS, Grade, Rating } from 'ts-fsrs';

type GradeButtonsProps = {
  onGrade: (grade: Grade) => void;
  card: Card;
};

const RATING_TO_KEY = {
  [Rating.Again]: '1',
  [Rating.Hard]: '2',
  [Rating.Good]: '3',
  [Rating.Easy]: '4',
} as Record<Rating, string>;

const RATING_TO_NAME = {
  [Rating.Again]: 'Again',
  [Rating.Hard]: 'Hard',
  [Rating.Good]: 'Good',
  [Rating.Easy]: 'Easy',
} as Record<Rating, string>;

function GradeButton({
  grade,
  onGrade,
  dateString,
  beforeGrade,
  pos,
}: {
  beforeGrade?: Grade;
  grade: Grade;
  onGrade: (grade: Grade) => void;
  dateString: string;
  pos: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'center';
}) {
  const key = RATING_TO_KEY[grade] ?? '';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === key) {
        onGrade(grade);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grade, key, onGrade]);

  return (
    <TooltipProvider key={grade} delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              'flex h-16 flex-col gap-0 transition sm:h-full bg-muted text-muted-foreground border rounded-none sm:rounded-xl',
              pos === 'top-right' && 'rounded-tr-2xl',
              pos === 'bottom-right' && 'rounded-br-2xl',
              pos === 'top-left' && 'rounded-tl-2xl',
              pos === 'bottom-left' && 'rounded-bl-2xl'
              // pos === 'center' && 'rounded-2xl'
            )}
            variant={beforeGrade === grade ? 'secondary' : 'ghost'}
            onClick={() => onGrade(grade)}
          >
            <div className='text-base'>{RATING_TO_NAME[grade]}</div>
            {/* <div className='sm:hidden'>{dateString}</div> */}
          </Button>
        </TooltipTrigger>
        <TooltipContent className='flex items-center'>
          <Kbd className='text-md mr-2'>{key}</Kbd>
          <p>{dateString}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * The buttons to rate a flashcard.
 */
export default function GradeButtons({ onGrade, card }: GradeButtonsProps) {
  const gradesToShow: Grade[] = [
    Rating.Again,
    Rating.Hard,
    Rating.Good,
    Rating.Easy,
  ];
  const f = new FSRS({});
  const schedulingCards = f.repeat(card, new Date());

  return (
    <div
      className={cn(
        'grid h-full grid-cols-2 gap-x-1 md:gap-x-3 gap-y-1 md:gap-y-2 sm:w-96 md:grid-cols-4'
      )}
    >
      <GradeButton
        key={Rating.Again}
        grade={Rating.Again}
        onGrade={() => onGrade(Rating.Again)}
        dateString={intlFormatDistance(
          schedulingCards[Rating.Again].card.due,
          new Date()
        )}
        pos='top-left'
      />

      <GradeButton
        key={Rating.Hard}
        grade={Rating.Hard}
        onGrade={() => onGrade(Rating.Hard)}
        dateString={intlFormatDistance(
          schedulingCards[Rating.Hard].card.due,
          new Date()
        )}
        pos='top-right'
      />

      <GradeButton
        key={Rating.Good}
        grade={Rating.Good}
        onGrade={() => onGrade(Rating.Good)}
        dateString={intlFormatDistance(
          schedulingCards[Rating.Good].card.due,
          new Date()
        )}
        pos='bottom-left'
      />

      <GradeButton
        key={Rating.Easy}
        grade={Rating.Easy}
        onGrade={() => onGrade(Rating.Easy)}
        dateString={intlFormatDistance(
          schedulingCards[Rating.Easy].card.due,
          new Date()
        )}
        pos='bottom-right'
      />
    </div>
  );
}

GradeButtons.displayName = 'GradeButtons';
