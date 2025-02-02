import { cn } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';

export default function BouncyButton({
  children,
  variant = 'default',
  className,
  pressed,
  asButton = false,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'medium';
  className?: string;
  pressed?: boolean;
  asButton?: boolean;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const [isReleased, setIsReleased] = useState(false);

  const handlePress = useCallback(() => {
    setIsPressed(true);
    setIsReleased(false);
  }, []);

  const handleRelease = useCallback(() => {
    setIsPressed(false);
    setIsReleased(true);
    // Reset the release state after the animation
    setTimeout(() => setIsReleased(false), 150);
  }, []);

  useEffect(() => {
    if (!isPressed) return;

    const handleMouseUp = () => {
      handleRelease();
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isPressed, handleRelease]);

  // To handle the case where the button is pressed but we drag the mouse away
  useEffect(() => {
    if (pressed === undefined) return;

    if (pressed && !isPressed) {
      handlePress();
    } else if (!pressed && isPressed) {
      handleRelease();
    }
  }, [pressed, isPressed, handlePress, handleRelease]);

  const Comp = asButton ? 'button' : 'div';

  return (
    <Comp
      className={cn(
        'h-max w-max cursor-pointer transition-transform duration-150 active:duration-100',
        isPressed && 'scale-90',
        isReleased && 'scale-105',
        variant == 'medium' && isPressed && 'scale-95',
        variant == 'medium' && 'duration-200 active:duration-150',
        variant == 'medium' && isReleased && 'scale-102',
        className,
      )}
      onMouseDown={handlePress}
      onDragEnd={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
    >
      {children}
    </Comp>
  );
}
