import BouncyButton from '@/components/bouncy-button';
import { CopyPlus } from 'lucide-react';
import { Link } from 'react-router';

export default function EmptyReviewUi() {
  return (
    <div className='bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl mt-12 mb-12 animate-fade-in'>
      {/* Main container with relative positioning */}
      <div className='relative w-full max-w-lg mx-auto'>
        {/* Blur backdrop */}
        <div className='absolute inset-0 backdrop-blur-lg bg-muted/20 rounded-lg' />

        {/* Content that sits on top of blur */}
        <div className='relative p-6 space-y-4 flex flex-col items-center justify-center'>
          <h2 className='text-xl font-bold text-background w-full text-center'>
            Great job! <br />
            You're done for now!
          </h2>
          <p className='text-muted text-center w-48 text-sm'>
            Come back later or create some new cards by clicking the button
            below.
          </p>
          <Link to='/create'>
            <BouncyButton>
              <CopyPlus className='h-12 w-12 text-background cursor-pointer' />
            </BouncyButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
