export interface GeneratedCard {
  front: string;
  back: string;
  exampleSentence: string;
  exampleSentenceTranslation: string;
}

export interface GenerateCardRequest {
  word: string;
  nativeLanguage?: string;
  targetLanguage?: string;
  mode?: 'single' | 'list' | 'sentence' | 'native-word';
  context?: string;
}

export interface ArticleAnalysisResult {
  isNoun: boolean;
  wordType?: string;
  article?: string;
  wordWithArticle?: string;
  error?: string;
}

export interface SmartAnalysisResult {
  type: 'single-word' | 'word-list' | 'sentence';
  words?: string[];
  sentence?: string;
  extractedWords?: { word: string; position: number }[];
  corrections?: string[];
  conjugations?: GeneratedCard[];
}

export interface WordSelectionData {
  sentence: string;
  words: { word: string; position: number; start: number; end: number }[];
  sentenceTranslation: string;
}

/**
 * Analyzes input text to determine the best approach for flashcard creation
 */
export async function analyzeInput(
  input: string
): Promise<SmartAnalysisResult> {
  return analyzeInputSmart(input);
}

/**
 * Smart analysis with enhanced features
 */
async function analyzeInputSmart(
  input: string
): Promise<SmartAnalysisResult> {
  const trimmed = input.trim();
  
  // 1. Check for list separators (commas, newlines, semicolons)
  const hasCommas = trimmed.includes(',');
  const hasNewlines = trimmed.includes('\n');
  const hasSemicolons = trimmed.includes(';');
  
  if (hasCommas || hasNewlines || hasSemicolons) {
    // Split on various separators and clean up
    const words = trimmed
      .split(/[,\n;]+/)
      .map(word => word.trim())
      .filter(word => word.length > 0);
      
    if (words.length > 1) {
      // Detect language and potentially correct spelling
      const processedWords = await processWordList(words);
      return {
        type: 'word-list',
        words: processedWords.words,
        corrections: processedWords.corrections
      };
    }
  }
  
  // 2. Check if it looks like a sentence (multiple words, ends with punctuation or is long)
  const wordCount = trimmed.split(/\s+/).length;
  const hasPunctuation = /[.!?]$/.test(trimmed);
  const isLongPhrase = wordCount > 4;
  
  if (wordCount > 2 && (hasPunctuation || isLongPhrase)) {
    return {
      type: 'sentence',
      sentence: trimmed
    };
  }
  
  // Removed native language input detection - always assume target language input
  
  // 4. Check for verb conjugation expansion
  const conjugations = await detectVerbConjugations();
  if (conjugations.length > 0) {
    return {
      type: 'single-word',
      conjugations
    };
  }
  
  // Default to single word
  return {
    type: 'single-word'
  };
}

/**
 * Process a list of words with smart features
 */
async function processWordList(
  words: string[]
): Promise<{ words: string[]; corrections?: string[] }> {
  const processedWords: string[] = [];
  const corrections: string[] = [];
  
  for (const word of words) {
    // Basic spelling correction placeholder
    const corrected = await spellCheckWord(word);
    if (corrected !== word) {
      corrections.push(`${word} → ${corrected}`);
      processedWords.push(corrected);
    } else {
      processedWords.push(word);
    }
  }
  
  return { words: processedWords, corrections: corrections.length > 0 ? corrections : undefined };
}


/**
 * Basic spell checking (placeholder implementation)
 */
async function spellCheckWord(word: string): Promise<string> {
  // This is a placeholder - in a real implementation you'd use a spell checking API
  // For now, just return the word as-is
  return word;
}

/**
 * Detect if a word might need verb conjugation expansion
 */
async function detectVerbConjugations(): Promise<GeneratedCard[]> {
  // This is a placeholder for verb conjugation detection
  // In a real implementation, you'd check if the word is a verb and generate conjugations
  return [];
}

/**
 * Generates multiple flashcards from a list of words
 */
export async function generateMultipleFlashcards(
  words: string[],
  nativeLanguage: string = 'English',
  targetLanguage: string = 'Spanish'
): Promise<GeneratedCard[]> {
  const cards: GeneratedCard[] = [];
  
  for (const word of words) {
    try {
      // Make both API calls simultaneously for each word
      const [generatedCard, articleAnalysis] = await Promise.all([
        generateFlashcard({
          word,
          nativeLanguage,
          targetLanguage,
          mode: 'list'
        }),
        analyzeWordForArticle(word, targetLanguage)
      ]);
      
      // Use the GPT-analyzed article if it's a noun, otherwise use the generated card as-is
      let finalFront = generatedCard.front;
      if (articleAnalysis.isNoun && articleAnalysis.wordWithArticle) {
        finalFront = articleAnalysis.wordWithArticle;
      }

      cards.push({
        ...generatedCard,
        front: finalFront
      });
      
      // Small delay to avoid overwhelming any external services
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.warn(`Failed to generate card for "${word}":`, error);
      // Create a fallback card
      cards.push({
        front: word,
        back: `Translation needed for "${word}"`,
        exampleSentence: `Example sentence with "${word}"`,
        exampleSentenceTranslation: 'Translation needed'
      });
    }
  }
  
  return cards;
}

/**
 * Analyze a word with GPT to determine if it's a noun and get appropriate definite article
 */
export async function analyzeWordForArticle(
  word: string,
  targetLanguage: string,
  context?: string
): Promise<ArticleAnalysisResult> {
  try {
    const response = await fetch('/api/analyze-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        word,
        targetLanguage,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      return {
        isNoun: false,
        error: result.error || 'Failed to analyze word'
      };
    }

    return {
      isNoun: result.data.isNoun,
      wordType: result.data.wordType,
      article: result.data.article,
      wordWithArticle: result.data.wordWithArticle
    };
  } catch (error) {
    console.error('Error analyzing word for article:', error);
    return {
      isNoun: false,
      error: 'Failed to analyze word. Using fallback.'
    };
  }
}


/**
 * Prepares a sentence for word selection by analyzing its structure
 */
export async function prepareSentenceForWordSelection(
  sentence: string,
  nativeLanguage: string = 'English',
  targetLanguage: string = 'Spanish'
): Promise<WordSelectionData> {
  // First, get a translation of the sentence
  const translation = await translateSentence(sentence, nativeLanguage, targetLanguage);
  
  // Extract selectable words from the sentence
  const words = extractSelectableWords(sentence);
  
  return {
    sentence,
    words,
    sentenceTranslation: translation
  };
}

/**
 * Extract selectable words from a sentence
 */
function extractSelectableWords(sentence: string): { word: string; position: number; start: number; end: number }[] {
  const words: { word: string; position: number; start: number; end: number }[] = [];
  
  // Use regex to find words (excluding punctuation)
  const wordRegex = /\b[a-zA-ZñáéíóúüÁÉÍÓÚÜÑ]+\b/g;
  let match;
  let position = 0;
  
  while ((match = wordRegex.exec(sentence)) !== null) {
    // Skip very short words (articles, prepositions) for cleaner selection
    if (match[0].length > 2) {
      words.push({
        word: match[0],
        position: position++,
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }
  
  return words;
}

/**
 * Translate a sentence using existing generateFlashcard API
 */
async function translateSentence(
  sentence: string,
  fromLanguage: string,
  toLanguage: string
): Promise<string> {
  try {
    // Use the existing generateFlashcard function as a translation service
    const result = await generateFlashcard({
      word: sentence,
      nativeLanguage: fromLanguage,
      targetLanguage: toLanguage,
      mode: 'sentence'
    });
    
    // Return the back side as the translation
    return result.back;
  } catch (error) {
    console.warn('Translation failed, returning placeholder:', error);
    return `Translation of: "${sentence}"`;
  }
}

export async function generateFlashcard(request: GenerateCardRequest): Promise<GeneratedCard> {
  const { word, nativeLanguage = 'English', targetLanguage = 'Spanish', context } = request;

  try {
    const response = await fetch('/api/generate-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        word,
        nativeLanguage,
        targetLanguage,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate flashcard');
    }

    return {
      front: result.data.front || word,
      back: result.data.back || `Translation needed for "${word}"`,
      exampleSentence: result.data.exampleSentence || `Example sentence with "${word}"`,
      exampleSentenceTranslation: result.data.exampleSentenceTranslation || `Translation needed`,
    };
  } catch (error) {
    console.error('Error generating flashcard:', error);
    throw new Error('Failed to generate flashcard. Please try again.');
  }
}