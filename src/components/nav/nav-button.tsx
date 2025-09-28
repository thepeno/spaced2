import BouncyButton from '@/components/bouncy-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import VibrationPattern from '@/lib/vibrate';
import React, { SVGProps, useState } from 'react';
import { Link } from 'react-router';

export default function NavButton({
  icon,
  href,
  focused,
}: {
  icon: React.ReactElement<SVGProps<SVGSVGElement>>;
  href: string;
  focused?: boolean;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <Link to={href} className='pb-3 pt-4' draggable={false}>
      <Button
        onMouseDown={() => {
          setPressed(true);
          navigator?.vibrate(VibrationPattern.buttonTap);
        }}
        onMouseUp={() => {
          setPressed(false);
        }}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => {
          setPressed(true);
          navigator?.vibrate(VibrationPattern.buttonTap);
        }}
        onTouchEnd={() => setPressed(false)}
        variant={'nav'}
        size={'nav'}
        className={cn(
          'relative group cursor-pointer text-muted-foreground/60 hover:text-muted-foreground',
          focused && 'text-muted-foreground'
        )}
      >
        <div
          className={cn(
            'absolute w-fit h-fit p-4 rounded-xl group-hover:bg-muted-foreground/10 scale-98 group-hover:scale-100 transition-all ease-out duration-200',
            focused && 'bg-muted-foreground/10 scale-100 md:bg-transparent'
          )}
        >
          <BouncyButton pressed={pressed}>
            {React.cloneElement(icon, {
              className: cn('!w-6 !h-6', icon.props.className),
              fill: focused ? 'currentColor' : 'none',
              strokeWidth: icon.props.strokeWidth || 2.5,
            })}
          </BouncyButton>
        </div>
      </Button>
    </Link>
  );
}
