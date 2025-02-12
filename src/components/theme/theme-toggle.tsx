import BouncyButton from '@/components/bouncy-button';
import { useTheme } from '@/components/theme/theme-provider';
import { MoonIcon, SunIcon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className='flex items-center justify-center'>
      <BouncyButton
        variant='large'
        asButton
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className='bg-background/50 dark:bg-muted/50 w-52 h-48 rounded-xl flex flex-col items-center justify-center'
      >
        {theme === 'dark' ? (
          <MoonIcon className='size-16' />
        ) : (
          <SunIcon className='size-16' />
        )}
        <div className='mt-2'>Theme</div>
      </BouncyButton>
    </div>
  );
}
