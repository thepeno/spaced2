import NavButton from '@/components/nav/nav-button';
import { cn } from '@/lib/utils';
import { Book, Bookmark, Home, Plus, UserRound } from 'lucide-react';
import { useLocation } from 'react-router';

export default function NavBar() {
  const path = useLocation();

  return (
    <div className={
      cn(
        'fixed bottom-0 full flex z-10 bg-muted w-full',
        'md:left-4 md:h-full md:flex-col md:justify-center md:w-16 -mx-2'
      )

    }>
      <NavButton
        icon={<Book />}
        href={'/decks'}
        focused={path.pathname === '/decks'}
      />

      {/* Bookmarks */}
      <NavButton
        icon={<Bookmark />}
        href={'/saved'}
        focused={path.pathname === '/saved'}
      />

      <NavButton
        icon={<Home className={cn('scale-x-110')} strokeWidth={2.5} />}
        href={'/'}
        focused={path.pathname === '/'}
      />

      <NavButton
        icon={<Plus strokeWidth={3} />}
        href={'/create'}
        focused={path.pathname === '/create'}
      />

      {/* Settings */}
      <NavButton
        icon={<UserRound />}
        href={'/profile'}
        focused={path.pathname === '/profile'}
      />
    </div>
  );
}
