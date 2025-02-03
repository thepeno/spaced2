import BouncyButton from '@/components/bouncy-button';
import { useOnlineStatus } from '@/components/hooks/online-status';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const online = useOnlineStatus();

  return (
    <BouncyButton
      asButton={true}
      variant='large'
      className={cn(
        'bg-background w-full rounded-xl py-4 px-6  cursor-pointer transition-all duration-100 ease-out',
        !online && 'cursor-not-allowed text-muted-foreground'
      )}
    >
      <div className='flex justify-between'>
        <span>Sign out</span>
        <LogOut className='w-6 h-6 text-muted-foreground' />
      </div>
    </BouncyButton>
  );
}
