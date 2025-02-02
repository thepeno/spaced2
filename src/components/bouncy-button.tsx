import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function BouncyButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const [isReleased, setIsReleased] = useState(false);

  const handlePress = () => {
    setIsPressed(true);
    setIsReleased(false);
  };

  const handleRelease = () => {
    setIsPressed(false);
    setIsReleased(true);
    // Reset the release state after the animation
    setTimeout(() => setIsReleased(false), 150);
  };

  return (
    <button
      className={cn(
        'h-max w-max text-background cursor-pointer transition-transform duration-150 active:duration-100',
        isPressed && 'scale-90',
        isReleased && 'scale-105'
      )}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
    >
      {children}
    </button>
  );
}
