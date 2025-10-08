import DeckCard from '@/components/deck/deck-card';
import DeckCardSkeleton from '@/components/deck/deck-card-skeleton';
import { useCardsForDeck, useDeck } from '@/components/hooks/query';
import { State } from 'ts-fsrs';

type DeckCardContainerProps = {
  id: string;
};

/**
 * Container for a deck card
 */
export default function DeckCardContainer({ id }: DeckCardContainerProps) {
  const deck = useDeck(id);
  const cards = useCardsForDeck(id);

  if (!deck) {
    return <DeckCardSkeleton />;
  }

  // Calculate cards left to review for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count how many new cards were reviewed for the first time today
  const newCardsReviewedToday = cards.filter(card => {
    if (card.reps === 1 && card.last_review) {
      const lastReview = new Date(card.last_review);
      lastReview.setHours(0, 0, 0, 0);
      return lastReview.getTime() === today.getTime();
    }
    return false;
  }).length;

  // Count new cards that are due (all new cards are "due")
  const newCardsDue = cards.filter(card => card.state === State.New).length;

  // Apply daily limit to new cards
  const newCardsLimit = Math.max(0, deck.newCardsPerDay - newCardsReviewedToday);
  const newCardsAvailableToday = Math.min(newCardsDue, newCardsLimit);

  // Count review cards (Learning, Relearning, Review) that are actually due
  const reviewCardsDue = cards.filter(card => {
    if (card.state === State.Learning || card.state === State.Relearning) return true;
    if (card.state === State.Review && new Date(card.due) <= new Date()) return true;
    return false;
  }).length;

  // Total cards left for today = limited new cards + all due review cards
  const unreviewedCount = newCardsAvailableToday + reviewCardsDue;

  return (
    <DeckCard
      id={id}
      name={deck.name}
      unreviewedCount={unreviewedCount}
    />
  );
}

DeckCardContainer.displayName = 'Deck';
