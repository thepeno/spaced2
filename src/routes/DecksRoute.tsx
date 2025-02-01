import DeckCard from '@/components/deck-card';
import { useDecks } from '@/components/hooks/query';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function DecksRoute() {
  const decks = useDecks();

  return (
    <div
      className={cn(
        'grid grid-cols-12 gap-x-6 items-start',
        'col-start-1 col-end-13',
        'xl:col-start-3 xl:col-end-11 xl:grid-cols-8',
        'h-full grid-rows-[min-content_1fr] px-0 pb-12 pt-6 sm:px-4'
      )}
    >
      <div className='flex items-center pl-2 sm:mb-4'>
        <h1 className='text-4xl md:text-4xl'>Decks</h1>
        <Separator className='ml-2 shrink' />
      </div>
      <section className='col-span-12 flex flex-wrap gap-x-4 gap-y-4 justify-start items-stretch mt-6 px-2'>
        {decks.map((deck) => (
          <DeckCard key={deck.id} id={deck.id} />
        ))}
      </section>
    </div>
  );
}
