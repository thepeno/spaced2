import { useReviewCards } from '@/components/hooks/query';
import { reviewSession } from '@/lib/review-session';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { State } from 'ts-fsrs';
import React, { useSyncExternalStore } from 'react';

export default function CardCountBadges() {
  const reviewCards = useReviewCards();
  const sessionSnapshot = useSyncExternalStore(
    reviewSession.subscribe.bind(reviewSession),
    reviewSession.getSnapshot.bind(reviewSession)
  );

  // Initialize session count on first render
  React.useEffect(() => {
    if (sessionSnapshot.sessionStartCount === 0 && reviewCards && reviewCards.length > 0) {
      reviewSession.setSessionStartCount(reviewCards.length);
    }
  }, [reviewCards, sessionSnapshot.sessionStartCount]);

  // Session-based counting
  const totalSessionCards = sessionSnapshot.sessionStartCount;
  const completedCards = sessionSnapshot.completedCardsCount;
  const learningCards = sessionSnapshot.learningCardsCount;
  
  // Remaining cards = total - (completed + learning)
  const numNewCards = Math.max(0, totalSessionCards - completedCards - learningCards);
  const numLearningCards = learningCards;
  const numCompletedThisSession = completedCards;

  return (
    <div className='flex h-8 justify-center gap-2'>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger className='cursor-text'>
            <Badge
              variant='dot'
              className='h-full before:bg-blue-500'
            >
              {numNewCards}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>New</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger className='cursor-text'>
            <Badge
              variant='dot'
              className='h-full before:bg-red-500'
            >
              {numLearningCards}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Learning</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger className='cursor-text'>
            <Badge
              variant='dot'
              className='h-full before:bg-green-500'
            >
              {numCompletedThisSession}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Completed this session</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
