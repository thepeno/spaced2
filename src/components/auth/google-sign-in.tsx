import { useLoggedInStatus } from '@/components/hooks/logged-in-status';
import { useEffect } from 'react';

export function GoogleSignInOneTap() {
  const { isLoggedIn } = useLoggedInStatus();
  useEffect(() => {
    if (isLoggedIn) return;
    // Load the Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, [isLoggedIn]);

  if (isLoggedIn) return null;

  return (
    <>
      <div
        id='g_id_onload'
        data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        data-context='signin'
        data-ux_mode='popup'
        data-login_uri={import.meta.env.VITE_GOOGLE_LOGIN_URI}
        data-itp_support='true'
      />
    </>
  );
}

export function GoogleSignIn() {
  const { isLoggedIn } = useLoggedInStatus();
  useEffect(() => {
    if (isLoggedIn) return;
    // Load the Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, [isLoggedIn]);

  return (
    <>
      <div
        id='g_id_onload'
        data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        data-context='signin'
        data-ux_mode='popup'
        data-login_uri={import.meta.env.VITE_GOOGLE_LOGIN_URI}
        data-auto_prompt='false'
      ></div>

      <div
        className='g_id_signin'
        data-type='standard'
        data-shape='pill'
        data-theme='outline'
        data-text='signin_with'
        data-size='large'
        data-logo_alignment='left'
      />
    </>
  );
}
