/**
 * Session-based immediate review queue for cards marked "Again"
 * This ensures cards marked as "Again" reappear immediately in the same session
 * even if they're not due according to their scheduled time
 */

class ReviewSession {
  private immediateReviewCards = new Set<string>();
  private completedCards = new Set<string>(); // Cards marked "Good"
  private learningCards = new Set<string>(); // Cards marked "Again" 
  private delayedCards = new Map<string, number>(); // Cards with their delay position
  private sessionStartCount = 0; // Total cards at session start
  private reviewCount = 0; // Number of cards reviewed so far
  private listeners = new Set<() => void>();
  private cachedSnapshot: {
    immediateReviewCards: string[];
    completedCardsCount: number;
    learningCardsCount: number;
    sessionStartCount: number;
    isInImmediateReview: (cardId: string) => boolean;
  } | null = null;

  /**
   * Add a card to delayed review queue (when marked "Again")
   * Card will reappear after a delay based on remaining cards
   */
  addToDelayedReview(cardId: string) {
    this.learningCards.add(cardId); // Mark as learning (red badge)
    
    // Calculate delay: up to 30 cards back, but at least at the end of current queue
    const remainingCards = this.sessionStartCount - this.completedCards.size - this.learningCards.size + 1;
    const maxDelay = Math.min(30, remainingCards);
    const delayPosition = this.reviewCount + maxDelay;
    
    this.delayedCards.set(cardId, delayPosition);
    this.invalidateSnapshot();
    this.notify();
  }

  /**
   * Check if any delayed cards should now be available for review
   */
  private updateDelayedCards() {
    const cardsToReactivate: string[] = [];
    
    for (const [cardId, delayPosition] of this.delayedCards.entries()) {
      if (this.reviewCount >= delayPosition) {
        cardsToReactivate.push(cardId);
      }
    }
    
    // Move delayed cards back to immediate review
    for (const cardId of cardsToReactivate) {
      this.immediateReviewCards.add(cardId);
      this.delayedCards.delete(cardId);
    }
    
    return cardsToReactivate.length > 0;
  }

  /**
   * Increment review count and update delayed cards
   */
  incrementReviewCount() {
    this.reviewCount++;
    const wasUpdated = this.updateDelayedCards();
    
    if (wasUpdated) {
      this.invalidateSnapshot();
      this.notify();
    }
  }

  /**
   * Remove a card from immediate review queue (when marked "Good" or better)
   */
  removeFromImmediateReview(cardId: string) {
    this.immediateReviewCards.delete(cardId);
    this.invalidateSnapshot();
    this.notify();
  }

  /**
   * Mark a card as completed in this session (when marked "Good")
   */
  markCardCompleted(cardId: string) {
    this.completedCards.add(cardId);
    this.learningCards.delete(cardId); // Remove from learning (no longer red)
    this.invalidateSnapshot();
    this.notify();
  }

  /**
   * Get count of cards completed in this session
   */
  getCompletedCardsCount(): number {
    return this.completedCards.size;
  }

  /**
   * Get count of cards in learning (marked "Again") in this session
   */
  getLearningCardsCount(): number {
    return this.learningCards.size;
  }

  /**
   * Set the initial count of cards in this session
   */
  setSessionStartCount(count: number) {
    this.sessionStartCount = count;
    this.invalidateSnapshot();
    this.notify();
  }

  /**
   * Get the initial count of cards at session start
   */
  getSessionStartCount(): number {
    return this.sessionStartCount;
  }

  /**
   * Handle undo operation - restore card's previous session state
   * This should be called when a card grade is undone
   */
  undoCardCompletion(cardId: string) {
    // Remove from all session tracking - let the next action re-add appropriately
    this.completedCards.delete(cardId);
    this.learningCards.delete(cardId);
    this.delayedCards.delete(cardId);
    this.immediateReviewCards.delete(cardId);
    
    // Decrement review count since we're undoing a review
    if (this.reviewCount > 0) {
      this.reviewCount--;
    }
    
    this.invalidateSnapshot();
    this.notify();
  }

  /**
   * Get all cards in immediate review queue
   */
  getImmediateReviewCards(): string[] {
    return Array.from(this.immediateReviewCards);
  }

  /**
   * Check if a card is in the immediate review queue
   */
  isInImmediateReview(cardId: string): boolean {
    return this.immediateReviewCards.has(cardId);
  }

  /**
   * Clear the entire session (end session)
   */
  clearSession() {
    this.immediateReviewCards.clear();
    this.completedCards.clear();
    this.learningCards.clear();
    this.delayedCards.clear();
    this.sessionStartCount = 0;
    this.reviewCount = 0;
    this.invalidateSnapshot();
    this.notify();
  }

  /**
   * Subscribe to changes in the review session
   */
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   */
  private notify() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Invalidate cached snapshot when state changes
   */
  private invalidateSnapshot() {
    this.cachedSnapshot = null;
  }

  /**
   * Get snapshot for React integration (cached to prevent infinite loops)
   */
  getSnapshot() {
    if (!this.cachedSnapshot) {
      const immediateReviewCards = this.getImmediateReviewCards();
      this.cachedSnapshot = {
        immediateReviewCards,
        completedCardsCount: this.getCompletedCardsCount(),
        learningCardsCount: this.getLearningCardsCount(),
        sessionStartCount: this.getSessionStartCount(),
        isInImmediateReview: (cardId: string) => immediateReviewCards.includes(cardId),
      };
    }
    return this.cachedSnapshot;
  }
}

// Singleton instance
export const reviewSession = new ReviewSession();