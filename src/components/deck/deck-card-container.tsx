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

  // Calculate unreviewed cards (New, Learning, Review that are due)
  const unreviewedCount = cards.filter(card => {
    if (card.state === State.New) return true;
    if (card.state === State.Learning || card.state === State.Relearning) return true;
    if (card.state === State.Review && new Date(card.due) <= new Date()) return true;
    return false;
  }).length;

  return (
    <DeckCard
      id={id}
      name={deck.name}
      unreviewedCount={unreviewedCount}
    />
  );
}

DeckCardContainer.displayName = 'Deck';
