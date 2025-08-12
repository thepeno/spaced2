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
}

export async function generateFlashcard(request: GenerateCardRequest): Promise<GeneratedCard> {
  const { word, nativeLanguage = 'English', targetLanguage = 'Spanish' } = request;

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