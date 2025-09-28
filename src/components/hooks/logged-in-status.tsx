import { useSyncExternalStore } from 'react';

type LoggedInStatus = {
  isLoggedIn: boolean;
  isLoading: boolean;
};

const checkLoginStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, {
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

let currentStatus: LoggedInStatus = {
  isLoggedIn: false,
  isLoading: true,
};

let listeners: (() => void)[] = [];

const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const getSnapshot = () => currentStatus;

export const emitChange = async () => {
  currentStatus = {
    ...currentStatus,
    isLoading: true,
  };
  const isLoggedIn = await checkLoginStatus();
  currentStatus = {
    isLoggedIn,
    isLoading: false,
  };

  for (const listener of listeners) {
    listener();
  }

  // Trigger user info update when login status changes
  const { emitUserInfoChange } = await import('./user-info');
  emitUserInfoChange(true); // Force refresh on login status change
};

// Initial check
checkLoginStatus().then((isLoggedIn) => {
  currentStatus = {
    isLoggedIn,
    isLoading: false,
  };
  emitChange();
});

export function useLoggedInStatus() {
  const status = useSyncExternalStore(subscribe, getSnapshot);
  return status;
}
