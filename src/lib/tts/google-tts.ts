import { BrowserTTS } from './browser-tts';


export class GoogleTTS {
  private static instance: GoogleTTS;
  private memoryCache = new Map<string, Blob>();
  private db: IDBDatabase | null = null;
  private dbName = 'google-tts-cache';
  private storeName = 'audio';
  private apiKey: string | null = null;
  private fallbackTTS: BrowserTTS;
  private currentAudio: HTMLAudioElement | null = null;

  private constructor() {
    this.fallbackTTS = BrowserTTS.getInstance();
    this.initDB();
    this.loadApiKey();
  }

  static getInstance(): GoogleTTS {
    if (!GoogleTTS.instance) {
      GoogleTTS.instance = new GoogleTTS();
    }
    return GoogleTTS.instance;
  }

  private async initDB() {
    try {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        console.error('Failed to open IndexedDB for Google TTS cache');
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
      console.error('Failed to initialize Google TTS cache database:', error);
    }
  }

  private loadApiKey() {
    this.apiKey = localStorage.getItem('google-tts-api-key');
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('google-tts-api-key', key);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  private getCacheKey(text: string, language: string): string {
    return `google:${language}:${text}`;
  }

  private async getFromCache(key: string): Promise<Blob | null> {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }

    if (!this.db) return null;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result;
          if (result && result.audioBlob) {
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
    this.memoryCache.set(key, blob);

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

  private languageCodeToGoogleCode(code: string): string {
    // Convert our language codes to Google Cloud TTS language codes
    const codeMap: Record<string, string> = {
      'af': 'af-ZA',
      'ar': 'ar-XA',
      'bg': 'bg-BG',
      'bn': 'bn-IN',
      'ca': 'ca-ES',
      'cs': 'cs-CZ',
      'da': 'da-DK',
      'de': 'de-DE',
      'el': 'el-GR',
      'en': 'en-US',
      'es': 'es-ES',
      'et': 'et-EE',
      'fa': 'fa-IR',
      'fi': 'fi-FI',
      'fr': 'fr-FR',
      'he': 'he-IL',
      'hi': 'hi-IN',
      'hr': 'hr-HR',
      'hu': 'hu-HU',
      'id': 'id-ID',
      'is': 'is-IS',
      'it': 'it-IT',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'lt': 'lt-LT',
      'lv': 'lv-LV',
      'ms': 'ms-MY',
      'nl': 'nl-NL',
      'no': 'no-NO',
      'pl': 'pl-PL',
      'pt': 'pt-PT',
      'pt-br': 'pt-BR',
      'ro': 'ro-RO',
      'ru': 'ru-RU',
      'sk': 'sk-SK',
      'sl': 'sl-SI',
      'sv': 'sv-SE',
      'th': 'th-TH',
      'tr': 'tr-TR',
      'uk': 'uk-UA',
      'ur': 'ur-IN',
      'vi': 'vi-VN',
      'zh': 'zh-CN',
    };

    // If it's already a Google code format, return as is
    if (code.includes('-')) {
      return code;
    }

    return codeMap[code.toLowerCase()] || 'en-US';
  }

  private getVoiceForLanguage(languageCode: string): string {
    // Normalize language code to uppercase format (e.g., pt-br -> pt-BR)
    let normalizedCode = languageCode;
    if (languageCode.includes('-')) {
      const parts = languageCode.split('-');
      normalizedCode = parts[0].toLowerCase() + '-' + parts[1].toUpperCase();
    }

    // Google Cloud TTS voice selection
    // Using Chirp3 HD voices for superior quality (requires v1beta1 API)
    const voiceMap: Record<string, string> = {
      'en-US': 'en-US-Chirp3-HD-F', // Female HD
      'es-ES': 'es-ES-Chirp3-HD-F', // Female HD
      'fr-FR': 'fr-FR-Chirp3-HD-F', // Female HD
      'de-DE': 'de-DE-Chirp3-HD-F', // Female HD
      'it-IT': 'it-IT-Chirp3-HD-F', // Female HD
      'pt-PT': 'pt-PT-Chirp3-HD-F', // Female HD
      'pt-BR': 'pt-BR-Chirp3-HD-Despina', // Brazilian Portuguese special voice
      'ja-JP': 'ja-JP-Chirp3-HD-F', // Female HD
      'ko-KR': 'ko-KR-Chirp3-HD-F', // Female HD
      'zh-CN': 'zh-CN-Chirp3-HD-F', // Female HD
      'ar-XA': 'ar-XA-Chirp3-HD-F', // Female HD
      'ru-RU': 'ru-RU-Chirp3-HD-F', // Female HD
      'nl-NL': 'nl-NL-Chirp3-HD-F', // Female HD
      'pl-PL': 'pl-PL-Chirp3-HD-F', // Female HD
      'sv-SE': 'sv-SE-Chirp3-HD-F', // Female HD
      'no-NO': 'no-NO-Chirp3-HD-F', // Female HD
      'da-DK': 'da-DK-Chirp3-HD-F', // Female HD
      'fi-FI': 'fi-FI-Chirp3-HD-F', // Female HD
      'cs-CZ': 'cs-CZ-Chirp3-HD-F', // Female HD
      'hu-HU': 'hu-HU-Chirp3-HD-F', // Female HD
      'ro-RO': 'ro-RO-Chirp3-HD-F', // Female HD
      'bg-BG': 'bg-BG-Chirp3-HD-F', // Female HD
      'hr-HR': 'hr-HR-Chirp3-HD-F', // Female HD
      'sk-SK': 'sk-SK-Chirp3-HD-F', // Female HD
      'sl-SI': 'sl-SI-Chirp3-HD-F', // Female HD
      'et-EE': 'et-EE-Chirp3-HD-F', // Female HD
      'lv-LV': 'lv-LV-Chirp3-HD-F', // Female HD
      'lt-LT': 'lt-LT-Chirp3-HD-F', // Female HD
    };

    // Fallback to Standard voice if Chirp not available
    const voice = voiceMap[normalizedCode] || `${languageCode}-Standard-A`;
    console.log(`Google TTS: Selected voice "${voice}" for language "${languageCode}"`);

    return voice;
  }

  private async fetchFromGoogle(text: string, languageCode: string): Promise<Blob> {
    if (!this.apiKey) {
      throw new Error('Google Cloud TTS API key not set');
    }

    const voice = this.getVoiceForLanguage(languageCode);
    
    // Use v1beta1 API for Chirp3 voices
    const isChirpVoice = voice.includes('Chirp');
    const apiVersion = isChirpVoice ? 'v1beta1' : 'v1';

    const response = await fetch(`https://texttospeech.googleapis.com/${apiVersion}/text:synthesize?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: languageCode.split('-')[0] + '-' + languageCode.split('-')[1], // e.g., en-US
          name: voice
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1, // Slower for language learning
          pitch: 0,
          volumeGainDb: 0
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google TTS API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    if (!data.audioContent) {
      throw new Error('No audio content received from Google TTS');
    }

    // Convert base64 to blob
    const audioBytes = atob(data.audioContent);
    const audioArray = new Uint8Array(audioBytes.length);
    for (let i = 0; i < audioBytes.length; i++) {
      audioArray[i] = audioBytes.charCodeAt(i);
    }

    return new Blob([audioArray], { type: 'audio/mpeg' });
  }

  async speak(text: string, language: string = 'en'): Promise<void> {
    const googleLanguageCode = this.languageCodeToGoogleCode(language);

    console.log(`Google TTS: Speaking "${text}" in language: ${language} -> ${googleLanguageCode}`);

    if (!this.hasApiKey()) {
      console.log('No Google TTS API key, falling back to browser TTS');
      return this.fallbackTTS.speak(text, language);
    }

    const cacheKey = this.getCacheKey(text, googleLanguageCode);

    try {
      let audioBlob = await this.getFromCache(cacheKey);

      if (!audioBlob) {
        audioBlob = await this.fetchFromGoogle(text, googleLanguageCode);
        await this.saveToCache(cacheKey, audioBlob);
      }

      // Stop any currently playing audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

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
      console.error('Google TTS failed, falling back to browser TTS:', error);
      return this.fallbackTTS.speak(text, language);
    }
  }

  stop() {
    // Stop currently playing Google TTS audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    // Also stop fallback TTS
    this.fallbackTTS.stop();
  }

  async clearCache() {
    this.memoryCache.clear();

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

export const googleTTS = GoogleTTS.getInstance();