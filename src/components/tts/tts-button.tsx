import { Play, Stop } from 'phosphor-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ttsManager } from '@/lib/tts/tts-manager';
import { useTTSSettings } from '@/components/hooks/tts-settings';
import { cn } from '@/lib/utils';

interface TTSButtonProps {
  text: string;
  language?: string | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
}

export function TTSButton({ 
  text, 
  language = 'English',
  size = 'sm',
  variant = 'ghost',
  className
}: TTSButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ttsSettings = useTTSSettings();
  
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    
    console.log(`TTSButton: Received language prop: "${language}", using: "${language || 'English'}"`);
    
    if (isPlaying) {
      ttsManager.stop();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setIsPlaying(true);
      try {
        // Stop any currently playing TTS to prevent overlapping
        ttsManager.stop();
        await ttsManager.speak(text, language || 'English');
      } catch (error) {
        console.error('TTS error:', error);
      } finally {
        setIsLoading(false);
        setIsPlaying(false);
      }
    }
  };
  
  // Don't render if no text or if click-to-play is enabled
  if (!text || ttsSettings.clickToPlay) {
    return null;
  }
  
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };
  
  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleClick}
      className={cn(
        sizeClasses[size],
        'transition-colors',
        (isPlaying || isLoading) && 'text-primary',
        className
      )}
      title={isPlaying ? 'Stop' : isLoading ? 'Loading...' : 'Play audio'}
      disabled={isLoading}
    >
      {isPlaying ? (
        <Stop className={iconSizes[size]} weight="fill" />
      ) : (
        <Play className={iconSizes[size]} weight="fill" />
      )}
    </Button>
  );
}