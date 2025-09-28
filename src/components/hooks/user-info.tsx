import { useSyncExternalStore } from 'react';

type UserInfo = {
  userId: string;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
} | null;

type UserInfoState = {
  userInfo: UserInfo;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'user-info-cache';

// Load cached data from localStorage
const loadCachedUserInfo = (): UserInfoState => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = Date.now();
      // Check if cache is still valid
      if (parsed.lastFetched && (now - parsed.lastFetched) < CACHE_DURATION) {
        return {
          ...parsed,
          isLoading: false,
        };
      }
    }
  } catch (error) {
    console.error('Error loading cached user info:', error);
  }
  return {
    userInfo: null,
    isLoading: true,
    error: null,
    lastFetched: null,
  };
};

// Save to localStorage
const saveCachedUserInfo = (state: UserInfoState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving user info to cache:', error);
  }
};

// Clear cache when user logs out
const clearCachedUserInfo = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing user info cache:', error);
  }
};

const fetchUserInfo = async (): Promise<UserInfo> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        clearCachedUserInfo(); // Clear cache on logout
        return null; // Not logged in
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};

// Initialize with cached data
let currentState: UserInfoState = loadCachedUserInfo();

let listeners: (() => void)[] = [];

const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const getSnapshot = () => currentState;

export const emitUserInfoChange = async (forceRefresh = false) => {
  // Skip fetch if we have valid cached data and not forcing refresh
  if (!forceRefresh && currentState.userInfo && currentState.lastFetched) {
    const now = Date.now();
    if ((now - currentState.lastFetched) < CACHE_DURATION) {
      return; // Use cached data
    }
  }

  currentState = {
    ...currentState,
    isLoading: true,
    error: null,
  };
  
  try {
    const userInfo = await fetchUserInfo();
    const newState = {
      userInfo,
      isLoading: false,
      error: null,
      lastFetched: userInfo ? Date.now() : null,
    };
    currentState = newState;
    
    // Save to localStorage if we got user data
    if (userInfo) {
      saveCachedUserInfo(newState);
    } else {
      clearCachedUserInfo();
    }
  } catch (error) {
    currentState = {
      userInfo: null,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      lastFetched: null,
    };
    clearCachedUserInfo();
  }

  for (const listener of listeners) {
    listener();
  }
};

// Initial setup - only fetch if cache is invalid or missing
if (!currentState.userInfo || !currentState.lastFetched) {
  emitUserInfoChange();
} else {
  // Validate cache in background
  const now = Date.now();
  if ((now - currentState.lastFetched) >= CACHE_DURATION) {
    emitUserInfoChange();
  }
}

export function useUserInfo() {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  
  return {
    ...state,
    refresh: () => emitUserInfoChange(true), // Force refresh
  };
}