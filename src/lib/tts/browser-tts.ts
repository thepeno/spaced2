export class BrowserTTS {
  private static instance: BrowserTTS;
  private speaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  
  // Singleton pattern to ensure only one instance
  static getInstance(): BrowserTTS {
    if (!BrowserTTS.instance) {
      BrowserTTS.instance = new BrowserTTS();
    }
    return BrowserTTS.instance;
  }
  
  speak(text: string, language: string = 'en'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      
      // Cancel any ongoing speech
      this.stop();
      
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      
      // Configure voice settings
      utterance.lang = this.getLanguageCode(language);
      utterance.rate = 0.85; // Slightly slower for language learning
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Wait for voices to load and find best voice for language
      const setVoice = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          // First try to find exact language match
          let voice = voices.find(v => v.lang === utterance.lang);
          
          // If not found, try to find a voice that starts with the language code
          if (!voice) {
            const langCode = utterance.lang.split('-')[0];
            voice = voices.find(v => v.lang.startsWith(langCode));
          }
          
          if (voice) {
            utterance.voice = voice;
          }
        }
      };
      
      // Some browsers need time to load voices
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
      } else {
        setVoice();
      }
      
      utterance.onend = () => {
        this.speaking = false;
        this.currentUtterance = null;
        resolve();
      };
      
      utterance.onerror = (event) => {
        this.speaking = false;
        this.currentUtterance = null;
        console.error('Speech synthesis error:', event);
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };
      
      utterance.onstart = () => {
        this.speaking = true;
      };
      
      // Small delay to ensure voice is set
      setTimeout(() => {
        speechSynthesis.speak(utterance);
      }, 10);
    });
  }
  
  stop() {
    if (this.speaking || this.currentUtterance) {
      speechSynthesis.cancel();
      this.speaking = false;
      this.currentUtterance = null;
    }
  }
  
  isPlaying(): boolean {
    return this.speaking;
  }
  
  private getLanguageCode(language: string | null): string {
    if (!language) return 'en-US';
    
    // Map full language names to locale codes
    const languageMap: Record<string, string> = {
      // English variants
      'English': 'en-US',
      'English (US)': 'en-US',
      'English (UK)': 'en-GB',
      'English (AU)': 'en-AU',
      
      // Spanish variants
      'Spanish': 'es-ES',
      'Spanish (Spain)': 'es-ES',
      'Spanish (Mexico)': 'es-MX',
      'Spanish (Argentina)': 'es-AR',
      
      // Other languages
      'French': 'fr-FR',
      'German': 'de-DE',
      'Italian': 'it-IT',
      'Portuguese': 'pt-BR',
      'Portuguese (Brazil)': 'pt-BR',
      'Portuguese (Portugal)': 'pt-PT',
      'Russian': 'ru-RU',
      'Japanese': 'ja-JP',
      'Korean': 'ko-KR',
      'Chinese': 'zh-CN',
      'Chinese (Simplified)': 'zh-CN',
      'Chinese (Traditional)': 'zh-TW',
      'Dutch': 'nl-NL',
      'Polish': 'pl-PL',
      'Turkish': 'tr-TR',
      'Arabic': 'ar-SA',
      'Hindi': 'hi-IN',
      'Swedish': 'sv-SE',
      'Norwegian': 'no-NO',
      'Danish': 'da-DK',
      'Finnish': 'fi-FI',
      'Greek': 'el-GR',
      'Hebrew': 'he-IL',
      'Thai': 'th-TH',
      'Vietnamese': 'vi-VN',
      'Indonesian': 'id-ID',
      'Czech': 'cs-CZ',
      'Hungarian': 'hu-HU',
      'Romanian': 'ro-RO',
      'Ukrainian': 'uk-UA',
    };
    
    // Check if it's already a locale code (e.g., "en-US")
    if (language.includes('-')) {
      return language;
    }
    
    // Try to match the language name
    return languageMap[language] || 'en-US';
  }
}

// Export singleton instance
export const tts = BrowserTTS.getInstance();