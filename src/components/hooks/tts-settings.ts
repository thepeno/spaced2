import { useState, useEffect } from 'react';

export interface TTSSettings {
  autoPlay: boolean;
  clickToPlay: boolean;
}

export function useTTSSettings(): TTSSettings {
  const [settings, setSettings] = useState<TTSSettings>(() => ({
    autoPlay: localStorage.getItem('tts-auto-play') !== 'false', // Default true
    clickToPlay: localStorage.getItem('tts-click-to-play') === 'true'
  }));

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings({
        autoPlay: localStorage.getItem('tts-auto-play') !== 'false',
        clickToPlay: localStorage.getItem('tts-click-to-play') === 'true'
      });
    };

    window.addEventListener('tts-settings-updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('tts-settings-updated', handleSettingsUpdate);
    };
  }, []);

  return settings;
}