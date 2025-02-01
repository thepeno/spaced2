import { Telescope } from 'lucide-react';
import { Link } from 'react-router';

export function SpacedIcon() {
  return (
    <Link to='https://github.com/zsh-eng/spaced2' target='_blank'>
      <div className='absolute top-4 md:top-4 left-1/2 -translate-x-1/2 md:left-4 w-16 h-12 z-30 flex items-center justify-center cursor-pointer'>
        <Telescope className='h-10 w-10' strokeWidth={1.8} />
      </div>
    </Link>
  );
}
