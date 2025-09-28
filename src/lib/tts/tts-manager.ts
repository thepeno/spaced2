import { openAITTS } from './openai-tts';
import { googleTTS } from './google-tts';
import { BrowserTTS } from './browser-tts';

export type TTSProvider = 'openai' | 'google' | 'browser';

export class TTSManager {
  private static instance: TTSManager;
  private currentProvider: TTSProvider;
  
  private constructor() {
    // Load saved provider preference
    const savedProvider = localStorage.getItem('tts-provider') as TTSProvider;
    this.currentProvider = savedProvider || 'openai';
  }
  
  static getInstance(): TTSManager {
    if (!TTSManager.instance) {
      TTSManager.instance = new TTSManager();
    }
    return TTSManager.instance;
  }
  
  setProvider(provider: TTSProvider) {
    this.currentProvider = provider;
    localStorage.setItem('tts-provider', provider);
    console.log(`TTS Provider changed to: ${provider}`);
  }
  
  getProvider(): TTSProvider {
    return this.currentProvider;
  }
  
  getAvailableProviders(): { value: TTSProvider; label: string; description: string; hasApiKey: boolean }[] {
    return [
      {
        value: 'openai',
        label: 'OpenAI TTS',
        description: 'High-quality voices with natural pronunciation',
        hasApiKey: openAITTS.hasApiKey()
      },
      {
        value: 'google',
        label: 'Google Cloud TTS',
        description: 'Excellent language support and Wavenet voices',
        hasApiKey: googleTTS.hasApiKey()
      },
      {
        value: 'browser',
        label: 'Browser TTS',
        description: 'Free built-in text-to-speech (basic quality)',
        hasApiKey: true // Always available
      }
    ];
  }
  
  async speak(text: string, language: string = 'en'): Promise<void> {
    console.log(`TTSManager: Using ${this.currentProvider} provider for "${text}"`);
    
    switch (this.currentProvider) {
      case 'openai':
        if (openAITTS.hasApiKey()) {
          return openAITTS.speak(text, language);
        } else {
          console.log('OpenAI TTS: No API key, falling back to browser TTS');
          return BrowserTTS.getInstance().speak(text, language);
        }
        
      case 'google':
        if (googleTTS.hasApiKey()) {
          return googleTTS.speak(text, language);
        } else {
          console.log('Google TTS: No API key, falling back to browser TTS');
          return BrowserTTS.getInstance().speak(text, language);
        }
        
      case 'browser':
      default:
        return BrowserTTS.getInstance().speak(text, language);
    }
  }
  
  stop() {
    // Stop all TTS services
    openAITTS.stop();
    googleTTS.stop();
    BrowserTTS.getInstance().stop();
  }
  
  // API key management
  setOpenAIApiKey(key: string) {
    openAITTS.setApiKey(key);
  }
  
  setGoogleApiKey(key: string) {
    googleTTS.setApiKey(key);
  }
  
  hasOpenAIApiKey(): boolean {
    return openAITTS.hasApiKey();
  }
  
  hasGoogleApiKey(): boolean {
    return googleTTS.hasApiKey();
  }
  
  // Cache management
  async clearAllCaches() {
    await Promise.all([
      openAITTS.clearCache(),
      googleTTS.clearCache()
    ]);
  }
  
  async getTotalCacheSize(): Promise<number> {
    const [openaiSize, googleSize] = await Promise.all([
      openAITTS.getCacheSize(),
      googleTTS.getCacheSize()
    ]);
    return openaiSize + googleSize;
  }
}

export const ttsManager = TTSManager.getInstance();