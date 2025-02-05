import { useEffect } from 'react';

export function GoogleSignIn() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <div
        id='g_id_onload'
        data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        data-context='signin'
        data-ux_mode='popup'
        data-login_uri={import.meta.env.VITE_BACKEND_URL + '/auth/google'}
        data-auto_prompt='false'
      ></div>

      <div
        className='g_id_signin'
        data-type='standard'
        data-shape='rectangular'
        data-theme='outline'
        data-text='signin_with'
        data-size='large'
        data-logo_alignment='left'
      ></div>
    </>
  );
}
