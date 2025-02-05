import { useLoggedInStatus } from '@/components/hooks/logged-in-status';
import { useEffect } from 'react';

export function useGoogleSignInPrompt({ delay = 1000 }: { delay?: number }) {
  const { isLoggedIn } = useLoggedInStatus();

  useEffect(() => {
    if (isLoggedIn) return;
    const timeout = setTimeout(() => {
      if (!window.google) {
        console.error('Google script not loaded');
        return;
      }

      // Initialize after 1 second to ensure script has loaded
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        ux_mode: 'redirect',
        login_uri: import.meta.env.VITE_BACKEND_URL + '/auth/google',
        context: 'signin',
        itp_support: true,
      });
      console.log('prompting');
      window.google.accounts.id.prompt();
    }, delay);

    return () => clearTimeout(timeout);
  }, [isLoggedIn, delay]);
}
