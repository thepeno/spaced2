import NavButton from '@/components/nav/nav-button';
import { cn, isEventTargetInput } from '@/lib/utils';
import { BookOpen, BookmarkSimple, House, Plus, User } from 'phosphor-react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

export default function NavBar() {
  const path = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command + 1, 2, 3 ,4, 5
      if (!e.shiftKey) return;
      if (isEventTargetInput(e)) return;
      if (e.key == '!') {
        navigate('/decks');
        return;
      }
      if (e.key == '@') {
        navigate('/saved');
        return;
      }
      if (e.key == '#') {
        navigate('/');
        return;
      }
      if (e.key == '$') {
        navigate('/create');
        return;
      }
      if (e.key == '%') {
        navigate('/profile');
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div
      className={cn(
        'bottom-0 full flex z-10 bg-muted dark:bg-background w-full',
        'md:left-4 md:h-full md:flex-col md:justify-center md:w-16 -mx-2'
      )}
    >
      <NavButton
        icon={<BookOpen />}
        href={'/decks'}
        focused={path.pathname === '/decks'}
      />

      {/* Bookmarks */}
      <NavButton
        icon={<BookmarkSimple />}
        href={'/saved'}
        focused={path.pathname === '/saved'}
      />

      <NavButton
        icon={<House className={cn('scale-x-110')} />}
        href={'/'}
        focused={path.pathname === '/'}
      />

      <NavButton
        icon={<Plus weight="bold" />}
        href={'/create'}
        focused={path.pathname === '/create'}
      />

      {/* Settings */}
      <NavButton
        icon={<User />}
        href={'/profile'}
        focused={path.pathname === '/profile'}
      />
    </div>
  );
}
