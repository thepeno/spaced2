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
}: {
  beforeGrade?: Grade;
  grade: Grade;
  onGrade: (grade: Grade) => void;
  dateString: string;
}) {
  const key = RATING_TO_KEY[grade] ?? '';

  return (
    <TooltipProvider key={grade} delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className='flex h-16 flex-col gap-0 transition sm:h-full'
            variant={beforeGrade === grade ? 'secondary' : 'outline'}
            onClick={() => onGrade(grade)}
          >
            <div>{RATING_TO_NAME[grade]}</div>
            <div className='sm:hidden'>{dateString}</div>
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
        'grid h-full grid-cols-2 gap-x-3 gap-y-2 sm:h-12 sm:w-96 md:grid-cols-4'
      )}
    >
      {gradesToShow.map((grade) => (
        <GradeButton
          key={grade}
          grade={grade}
          onGrade={() => onGrade(grade)}
          dateString={intlFormatDistance(
            schedulingCards[grade].card.due,
            new Date()
          )}
        />
      ))}
    </div>
  );
}

GradeButtons.displayName = 'GradeButtons';
