import { getSessionExpiry } from '@/lib/sync/meta';
import { useLiveQuery } from 'dexie-react-hooks';

export function useSessionExpired() {
  const sessionExpiry = useLiveQuery(getSessionExpiry);
  if (!sessionExpiry) {
    return false;
  }

  const now = new Date();
  return now > sessionExpiry;
}
