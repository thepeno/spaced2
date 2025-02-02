import { Button } from '@/components/ui/button';
import { cn, debounce } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ReturnToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = debounce(() => {
      console.log('scroll', window.scrollY);
      setIsVisible(window.scrollY > 100);
    }, 150);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return createPortal(
    <Button
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-30 rounded-full shadow-sm opacity-100 transition-all scale-100',
        !isVisible && 'opacity-0 scale-90'
      )}
      onClick={() =>
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
      }
    >
      <ArrowUp className='h-4 w-4' />
    </Button>,
    document.body
  );
}
