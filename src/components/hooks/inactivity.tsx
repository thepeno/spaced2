import { debounce } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

const INACTIVITY_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes
const DEBOUNCE_WAIT_MS = 1000; // 1 second

export function useActiveStartTime(): number {
  const now = Date.now();
  const [startTime, setStartTime] = useState(now);
  const lastInteractionRef = useRef(now);

  const handleUserActivity = debounce(() => {
    const now = Date.now();
    const timeSinceLastInteraction = now - lastInteractionRef.current;
    console.log('timeSinceLastInteraction', timeSinceLastInteraction);

    if (timeSinceLastInteraction > INACTIVITY_THRESHOLD_MS) {
      // User was inactive, reset start time
      setStartTime(now);
    }

    lastInteractionRef.current = now;
  }, DEBOUNCE_WAIT_MS);

  useEffect(() => {
    // Track user interactions
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [handleUserActivity]);

  return startTime;
}
