import { Gear } from 'phosphor-react';
import { Link } from 'react-router';
import BouncyButton from '../bouncy-button';
import { cn } from '@/lib/utils';

export function SettingsLinkButton() {
  return (
    <Link to='/profile/settings'>
      <BouncyButton
        variant='large'
        asButton={true}
        className={cn(
          'bg-background dark:bg-muted/50 w-full rounded-xl py-4 px-6  cursor-pointer transition-all duration-100 ease-out'
        )}
      >
        <div className='flex justify-between'>
          <span>Settings</span>
          <Gear className="w-6 h-6 text-muted-foreground" />
        </div>
      </BouncyButton>
    </Link>
  );
}