import { useLoggedInStatus } from '@/components/hooks/logged-in-status';
import { useEffect } from 'react';

export function useGoogleSignInPrompt({ delay = 1000 }: { delay?: number }) {
  const { isLoggedIn } = useLoggedInStatus();

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      ux_mode: 'redirect',
      login_uri: import.meta.env.VITE_BACKEND_URL + '/auth/google',
      context: 'signin',
      itp_support: true,
    });

    if (isLoggedIn) return;
    const timeout = setTimeout(() => {
      console.log('prompting');
      window.google.accounts.id.prompt();
    }, delay);

    return () => clearTimeout(timeout);
  }, [isLoggedIn, delay]);
}
