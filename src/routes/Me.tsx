import { useEffect, useState } from 'react';

// temporary route for testing login functionality
export default function MeRoute() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/me`, {
        credentials: 'include',
      });
      const data = await response.json();
      setUserId(data.userId);
    };
    fetchMe();
  }, [userId]);

  return <div>Me: {userId}</div>;
}
