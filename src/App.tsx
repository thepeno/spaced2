import { useDecks, useReviewCards } from '@/components/hooks/query';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';
import { State } from 'ts-fsrs';

function WavesSVG() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' className='w-full h-full'>
      <defs>
        <pattern
          id='a'
          width='70'
          height='8'
          patternTransform='scale(2)'
          patternUnits='userSpaceOnUse'
        >
          <rect width='100%' height='100%' fill='#bedbfe' />
          <path
            fill='none'
            stroke='#1e3b8a'
            d='M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002'
          />
        </pattern>
      </defs>
      <rect width='800%' height='800%' fill='url(#a)' />
    </svg>
  );
}

function HomepageStats() {
  const cards = useReviewCards();
  const total = cards.length;
  const newCount = cards.filter((card) => card.state === State.New).length;
  const learningCount = cards.filter(
    (card) => card.state === State.Learning || card.state === State.Relearning
  ).length;
  const reviewCount = cards.filter(
    (card) => card.state === State.Review
  ).length;

  return (
    <div className='grid grid-cols-4 gap-x-2 mt-2 max-w-2xl self-center w-full px-1'>
      <Card className='flex flex-col gap-2 col-span-3 h-full justify-center items-center relative overflow-hidden bg-gradient-to-br from-gray-800 via-blue-700 to-gray-900 border-3 border-background'>
        <div className='absolute inset-0 opacity-20'>
          <WavesSVG />
        </div>
        <p className='text-5xl font-bold text-background relative z-10'>
          {total}
        </p>
        <p className='text-sm text-muted relative z-10'>cards to review</p>
      </Card>
      <div className='flex flex-col gap-2 col-span-1'>
        <Card className='bg-blue-900 h-32 md:h-40 flex flex-col justify-center items-center w-full border-3 border-background'>
          <p className='text-2xl font-bold text-background'>{newCount}</p>
          <p className='text-sm text-muted'>new</p>
        </Card>
        <Card className='bg-blue-900 h-32 md:h-40 flex flex-col justify-center items-center w-full border-3 border-background'>
          <p className='text-2xl font-bold text-background'>{learningCount}</p>
          <p className='text-sm text-muted'>learning</p>
        </Card>
        <Card className='bg-blue-900 h-32 md:h-40 flex flex-col justify-center items-center w-full border-3 border-background'>
          <p className='text-2xl font-bold text-background'>{reviewCount}</p>
          <p className='text-sm text-muted'>review</p>
        </Card>
      </div>
    </div>
  );
}

function HomepageCard({
  title,
  href,
  backgroundType,
}: {
  title: string;
  href: string;
  backgroundType: 'cool-mint' | 'cyan' | 'plate-armor';
}) {
  return (
    <Link to={href}>
      <Card
        className={cn(
          'h-60 w-48 relative cursor-pointer border-3 border-background',
          'hover:scale-105 transition-all duration-300',
          backgroundType === 'cool-mint'
            ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
            : backgroundType === 'cyan'
            ? 'bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-400'
            : 'bg-gradient-to-br from-gray-300 via-gray-500 to-gray-700'
        )}
      >
        <h2 className='absolute bottom-4 right-4 text-white text-xl font-semibold'>
          {title}
        </h2>
      </Card>
    </Link>
  );
}

function HomepageCarousel() {
  const decks = useDecks();

  return (
    <div className='flex gap-4 py-4 overflow-x-scroll'>
      <HomepageCard title='Review' href='/review' backgroundType='cool-mint' />
      <HomepageCard title='Decks' href='/decks' backgroundType='cyan' />
      {decks.map((deck) => (
        <HomepageCard
          key={deck.id}
          title={deck.name}
          href={`/decks/${deck.id}`}
          backgroundType='plate-armor'
        />
      ))}
    </div>
  );
}

function HomeRoute() {
  return (
    <div className='flex flex-col h-max col-start-1 col-end-13 xl:col-start-3 xl:col-end-11 md:px-4'>
      <h1 className='mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0'>
        Welcome back!
      </h1>
      <HomepageCarousel />
      <HomepageStats />

      {/* <div className='flex justify-end w-full'>
        <Link to='/review' className={buttonVariants({ variant: 'outline' })}>
          Review ({reviewCards.length})
        </Link>
      </div>

      <div className='text-center mb-6'>
        <h1 className='text-2xl font-bold mb-4'>Flashcard Stats</h1>
        <div className='space-y-2'>
          <p>Total cards: {cards.length}</p>
          <p>Cards due for review: {reviewCards.length}</p>
        </div>
      </div>

      <CreateFlashcardForm
        onSubmit={(data) => {
          createNewCard(data.front, data.back);
        }}
      /> */}
    </div>
  );
}

export default HomeRoute;
