import Deck from '@/components/deck-card';
import { useDecks } from '@/components/hooks/query';
import { Separator } from '@/components/ui/separator';

export default function DecksRoute() {
  const decks = useDecks();

  return (
    <div>
      <div className='col-span-12 flex items-center pl-2 sm:mb-4'>
        <h1 className='text-4xl md:text-4xl'>Decks</h1>
        <Separator className='ml-2 shrink' />
      </div>
      <section className='col-span-12 flex flex-wrap gap-x-4 gap-y-4 justify-start items-stretch mt-6 px-2'>
        {decks.map((deck) => (
          <Deck key={deck.id} id={deck.id} />
        ))}
      </section>
    </div>
  );
}
