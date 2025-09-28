/**
 * Utility functions for managing card creation settings
 */

export function shouldCreateBidirectionalCards(): boolean {
  const saved = localStorage.getItem('create-bidirectional-cards');
  return saved === null ? true : saved === 'true'; // Default to true
}

export interface CardCreationSettings {
  createBidirectionalCards: boolean;
}

export function getCardCreationSettings(): CardCreationSettings {
  return {
    createBidirectionalCards: shouldCreateBidirectionalCards()
  };
}