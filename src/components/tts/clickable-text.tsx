import { useState } from 'react';
import { ttsManager } from '@/lib/tts/tts-manager';
import { useTTSSettings } from '@/components/hooks/tts-settings';
import { cn } from '@/lib/utils';

interface ClickableTextProps {
  text: string;
  language?: string | null;
  className?: string;
  children: React.ReactNode;
}

export function ClickableText({ 
  text, 
  language = 'English',
  className,
  children
}: ClickableTextProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const ttsSettings = useTTSSettings();

  const handleClick = async (e: React.MouseEvent) => {
    // Only handle click if click-to-play is enabled
    if (!ttsSettings.clickToPlay || !text) {
      return;
    }

    e.stopPropagation();
    
    if (isPlaying) {
      ttsManager.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      try {
        await ttsManager.speak(text, language || 'English');
      } catch (error) {
        console.error('TTS error:', error);
      } finally {
        setIsPlaying(false);
      }
    }
  };

  return (
    <span
      onClick={handleClick}
      className={cn(
        ttsSettings.clickToPlay && text ? [
          'cursor-pointer',
          'hover:bg-primary/10 rounded px-1 -mx-1',
          'transition-colors duration-200',
          isPlaying && 'bg-primary/20'
        ] : undefined,
        className
      )}
      title={ttsSettings.clickToPlay && text ? 'Click to play audio' : undefined}
    >
      {children}
    </span>
  );
}