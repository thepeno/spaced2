import DeckCard from "@/components/deck/deck-card";
import { useCards } from "@/components/hooks/query";

export default function AllDecksCardContainer() {
  const cards = useCards();

  return (
    <DeckCard
      id="_all"
      name="All Cards"
      unreviewedCount={cards.length}
    />
  );
}
