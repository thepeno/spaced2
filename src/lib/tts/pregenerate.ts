import { openAITTS } from './openai-tts';
import { googleTTS } from './google-tts';
import { ttsManager } from './tts-manager';

/**
 * Silently pre-generates TTS audio for flashcard content without playing it
 * This creates and caches the audio for faster first-time review experience
 */
export async function pregenerateTTS(
  front: string,
  back: string,
  targetLanguage: string | null,
  _nativeLanguage: string | null,
  exampleSentence?: string | null,
  exampleSentenceTranslation?: string | null,
  isReverse: boolean = false
): Promise<void> {
  // Only generate TTS for target language content
  if (!targetLanguage) {
    console.log('No target language specified, skipping TTS pre-generation');
    return;
  }

  const tasks: Promise<void>[] = [];

  // For forward cards (isReverse = false): front = target, exampleSentence = target
  // For reverse cards (isReverse = true): back = target, exampleSentenceTranslation = target
  const targetWord = isReverse ? back : front;
  const targetExample = isReverse ? exampleSentenceTranslation : exampleSentence;

  if (targetWord) {
    console.log(`Pre-generating TTS for target word: "${targetWord}" in ${targetLanguage}`);
    tasks.push(pregenerateSingleText(targetWord, targetLanguage));
  }

  if (targetExample) {
    console.log(`Pre-generating TTS for target example: "${targetExample}" in ${targetLanguage}`);
    tasks.push(pregenerateSingleText(targetExample, targetLanguage));
  }

  // Wait for all TTS generation tasks to complete (or fail)
  if (tasks.length > 0) {
    try {
      await Promise.allSettled(tasks);
      console.log(`TTS pre-generation completed for card "${targetWord}"`);
    } catch (error) {
      console.warn('Some TTS pre-generation tasks failed:', error);
    }
  }
}

/**
 * Pre-generates TTS for a single text without playing it
 */
async function pregenerateSingleText(text: string, language: string): Promise<void> {
  const currentProvider = ttsManager.getProvider();
  
  try {
    switch (currentProvider) {
      case 'openai':
        if (openAITTS.hasApiKey()) {
          await pregenerateOpenAI(text, language);
        }
        break;
        
      case 'google':
        if (googleTTS.hasApiKey()) {
          await pregenerateGoogle(text, language);
        }
        break;
        
      case 'browser':
        // Browser TTS doesn't need pre-generation as it's generated on demand
        break;
    }
  } catch (error) {
    console.warn(`Failed to pre-generate TTS for "${text}":`, error);
  }
}

/**
 * Pre-generates OpenAI TTS by calling the API and caching the result
 */
async function pregenerateOpenAI(text: string, language: string): Promise<void> {
  // Access private methods through type assertion for pre-generation
  const openAIService = openAITTS as unknown as {
    languageCodeToName: (code: string) => string;
    getCacheKey: (text: string, language: string) => string;
    getFromCache: (key: string) => Promise<Blob | null>;
    fetchFromOpenAI: (text: string, language: string) => Promise<Blob>;
    saveToCache: (key: string, blob: Blob) => Promise<void>;
  };
  
  const fullLanguageName = openAIService.languageCodeToName(language);
  const cacheKey = openAIService.getCacheKey(text, fullLanguageName);
  
  // Check if already cached
  const cached = await openAIService.getFromCache(cacheKey);
  if (cached) {
    console.log(`OpenAI TTS already cached for: "${text}"`);
    return;
  }
  
  // Generate and cache the audio without playing
  try {
    const audioBlob = await openAIService.fetchFromOpenAI(text, fullLanguageName);
    await openAIService.saveToCache(cacheKey, audioBlob);
    console.log(`OpenAI TTS cached for: "${text}"`);
  } catch (error) {
    console.warn(`Failed to pre-generate OpenAI TTS for "${text}":`, error);
  }
}

/**
 * Pre-generates Google TTS by calling the API and caching the result
 */
async function pregenerateGoogle(text: string, language: string): Promise<void> {
  // Access private methods through type assertion for pre-generation
  const googleService = googleTTS as unknown as {
    languageCodeToGoogleCode: (code: string) => string;
    getCacheKey: (text: string, language: string) => string;
    getFromCache: (key: string) => Promise<Blob | null>;
    fetchFromGoogle: (text: string, languageCode: string) => Promise<Blob>;
    saveToCache: (key: string, blob: Blob) => Promise<void>;
  };
  
  const googleLanguageCode = googleService.languageCodeToGoogleCode(language);
  const cacheKey = googleService.getCacheKey(text, googleLanguageCode);
  
  // Check if already cached
  const cached = await googleService.getFromCache(cacheKey);
  if (cached) {
    console.log(`Google TTS already cached for: "${text}"`);
    return;
  }
  
  // Generate and cache the audio without playing
  try {
    const audioBlob = await googleService.fetchFromGoogle(text, googleLanguageCode);
    await googleService.saveToCache(cacheKey, audioBlob);
    console.log(`Google TTS cached for: "${text}"`);
  } catch (error) {
    console.warn(`Failed to pre-generate Google TTS for "${text}":`, error);
  }
}

