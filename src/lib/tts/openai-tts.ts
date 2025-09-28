import { BrowserTTS } from './browser-tts';

export class OpenAITTS {
  private static instance: OpenAITTS;
  private memoryCache = new Map<string, Blob>();
  private db: IDBDatabase | null = null;
  private dbName = 'tts-cache';
  private storeName = 'audio';
  private apiKey: string | null = null;
  private fallbackTTS: BrowserTTS;
  private currentAudio: HTMLAudioElement | null = null;
  
  private constructor() {
    this.fallbackTTS = BrowserTTS.getInstance();
    this.initDB();
    this.loadApiKey();
  }
  
  static getInstance(): OpenAITTS {
    if (!OpenAITTS.instance) {
      OpenAITTS.instance = new OpenAITTS();
    }
    return OpenAITTS.instance;
  }
  
  private async initDB() {
    try {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB for TTS cache');
      };
      
      request.onsuccess = () => {
        this.db = request.result;
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    } catch (error) {
      console.error('Failed to initialize TTS cache database:', error);
    }
  }
  
  private loadApiKey() {
    // Try to load from localStorage first
    this.apiKey = localStorage.getItem('openai-api-key');
  }
  
  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai-api-key', key);
  }
  
  hasApiKey(): boolean {
    return !!this.apiKey;
  }
  
  private getCacheKey(text: string, language: string): string {
    // Create a unique key based on text and language
    return `${language}:${text}`;
  }
  
  private async getFromCache(key: string): Promise<Blob | null> {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }
    
    // Check IndexedDB
    if (!this.db) return null;
    
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
        
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.audioBlob) {
            // Add to memory cache
            this.memoryCache.set(key, result.audioBlob);
            resolve(result.audioBlob);
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => {
          console.error('Failed to get from cache:', request.error);
          resolve(null);
        };
      } catch (error) {
        console.error('Cache retrieval error:', error);
        resolve(null);
      }
    });
  }
  
  private async saveToCache(key: string, blob: Blob) {
    // Save to memory cache
    this.memoryCache.set(key, blob);
    
    // Save to IndexedDB
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const cacheEntry = {
        key,
        audioBlob: blob,
        timestamp: Date.now()
      };
      
      store.put(cacheEntry);
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }
  
  private languageCodeToName(code: string): string {
    // Convert language codes to full names for OpenAI TTS
    const codeMap: Record<string, string> = {
      'af': 'Afrikaans',
      'ar': 'Arabic', 
      'bg': 'Bulgarian',
      'bn': 'Bengali',
      'ca': 'Catalan',
      'cs': 'Czech',
      'da': 'Danish',
      'de': 'German',
      'el': 'Greek',
      'en': 'English',
      'es': 'Spanish',
      'et': 'Estonian',
      'fa': 'Persian',
      'fi': 'Finnish',
      'fr': 'French',
      'he': 'Hebrew',
      'hi': 'Hindi',
      'hr': 'Croatian',
      'hu': 'Hungarian',
      'id': 'Indonesian',
      'is': 'Icelandic',
      'it': 'Italian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'lt': 'Lithuanian',
      'lv': 'Latvian',
      'ms': 'Malay',
      'nl': 'Dutch',
      'no': 'Norwegian',
      'pl': 'Polish',
      'pt': 'Portuguese',
      'pt-br': 'Portuguese',
      'ro': 'Romanian',
      'ru': 'Russian',
      'sk': 'Slovak',
      'sl': 'Slovenian',
      'sv': 'Swedish',
      'th': 'Thai',
      'tr': 'Turkish',
      'uk': 'Ukrainian',
      'ur': 'Urdu',
      'vi': 'Vietnamese',
      'zh': 'Chinese',
    };
    
    // If it's already a full name, return as is
    // Otherwise convert from code
    return codeMap[code.toLowerCase()] || code;
  }

  private prepareTextForTTS(text: string, language: string): string {
    const fullLanguageName = this.languageCodeToName(language);
    
    // For some languages, we can add pronunciation hints
    // This is especially helpful for languages that might be ambiguous
    const needsLanguageHint = ['Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'];
    
    if (needsLanguageHint.includes(fullLanguageName)) {
      // Add language context to help with pronunciation
      console.log(`TTS: Adding language context for ${fullLanguageName}: "${text}"`);
      return `[${fullLanguageName}] ${text}`;
    }
    
    console.log(`TTS: Using text as-is for ${fullLanguageName}: "${text}"`);
    return text;
  }

  private getVoiceForLanguage(language: string): string {
    // Convert language code to full name first
    const fullLanguageName = this.languageCodeToName(language);
    
    // Map languages to OpenAI voices
    // Available voices: alloy, echo, fable, onyx, nova, shimmer
    const voiceMap: Record<string, string> = {
      'English': 'nova',
      'Spanish': 'nova',
      'French': 'shimmer',
      'German': 'alloy',
      'Italian': 'shimmer',
      'Portuguese': 'nova',
      'Japanese': 'nova',
      'Korean': 'echo',
      'Chinese': 'alloy',
      'Arabic': 'echo',
      'Russian': 'alloy',
      'Dutch': 'shimmer',
      'Polish': 'nova',
      'Swedish': 'shimmer',
      'Norwegian': 'shimmer',
      'Danish': 'shimmer',
      'Finnish': 'nova',
      'Czech': 'alloy',
      'Hungarian': 'echo',
      'Romanian': 'nova',
      'Bulgarian': 'alloy',
      'Croatian': 'nova',
      'Slovak': 'alloy',
      'Slovenian': 'nova',
      'Estonian': 'shimmer',
      'Latvian': 'shimmer',
      'Lithuanian': 'nova',
      // Default
      'default': 'nova'
    };
    
    const selectedVoice = voiceMap[fullLanguageName] || voiceMap.default;
    console.log(`TTS: Selected voice "${selectedVoice}" for language "${fullLanguageName}"`);
    
    return selectedVoice;
  }
  
  private async fetchFromOpenAI(text: string, language: string): Promise<Blob> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set');
    }
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts', // Use higher quality model for better pronunciation
        input: this.prepareTextForTTS(text, language),
        voice: this.getVoiceForLanguage(language),
        response_format: 'mp3',
        speed: 0.8 // Slower for clearer pronunciation in language learning
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI TTS API error: ${response.status} - ${error}`);
    }
    
    return response.blob();
  }
  
  async speak(text: string, language: string = 'English'): Promise<void> {
    // Convert language code to full name if needed
    const fullLanguageName = this.languageCodeToName(language);
    
    console.log(`TTS: Speaking "${text}" in language: ${language} -> ${fullLanguageName}`);
    
    // If no API key, fall back to browser TTS
    if (!this.hasApiKey()) {
      console.log('No OpenAI API key, falling back to browser TTS');
      return this.fallbackTTS.speak(text, language);
    }
    
    const cacheKey = this.getCacheKey(text, fullLanguageName);
    
    try {
      // Try to get from cache first
      let audioBlob = await this.getFromCache(cacheKey);
      
      if (!audioBlob) {
        // Fetch from OpenAI using the full language name
        audioBlob = await this.fetchFromOpenAI(text, fullLanguageName);
        
        // Save to cache for future use
        await this.saveToCache(cacheKey, audioBlob);
      }
      
      // Stop any currently playing audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      // Play the audio
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (this.currentAudio === audio) {
            this.currentAudio = null;
          }
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          if (this.currentAudio === audio) {
            this.currentAudio = null;
          }
          reject(error);
        };
        
        audio.play().catch(reject);
      });
      
    } catch (error) {
      console.error('OpenAI TTS failed, falling back to browser TTS:', error);
      // Fall back to browser TTS if OpenAI fails
      return this.fallbackTTS.speak(text, language);
    }
  }
  
  stop() {
    // Stop currently playing OpenAI TTS audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    // Also stop fallback TTS
    this.fallbackTTS.stop();
  }
  
  async clearCache() {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear IndexedDB
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.clear();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
  
  async getCacheSize(): Promise<number> {
    if (!this.db) return 0;
    
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const items = request.result || [];
          const totalSize = items.reduce((sum, item) => {
            return sum + (item.audioBlob?.size || 0);
          }, 0);
          resolve(totalSize);
        };
        
        request.onerror = () => {
          resolve(0);
        };
      } catch {
        resolve(0);
      }
    });
  }
}

export const openAITTS = OpenAITTS.getInstance();