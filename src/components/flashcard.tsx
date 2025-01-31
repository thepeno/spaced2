import { CardWithMetadata } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function Flashcard({
  card,
  isReview,
}: {
  card: CardWithMetadata;
  isReview?: boolean;
}) {
  return (
    <div className={cn('flex flex-col gap-2', isReview && 'bg-green-200')}>
      <div>{card.question}</div>
      <div>{card.answer}</div>
    </div>
  );
}
