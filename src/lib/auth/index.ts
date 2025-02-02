import { setClientId } from '@/lib/sync/meta';

type LoginResponse = {
  success: boolean;
  message?: string;
};

const UNAUTHORIZED_MESSAGE = 'Invalid email or password';
const UNKNOWN_ERROR_MESSAGE = 'An unknown error occurred';

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (response.status === 401) {
    return {
      success: false,
      message: UNAUTHORIZED_MESSAGE,
    };
  }

  if (!response.ok) {
    return {
      success: false,
      message: UNKNOWN_ERROR_MESSAGE,
    };
  }

  return {
    success: true,
  };
}

type RegisterClientResponse = {
  success: boolean;
  message?: string;
};

export async function registerClient(): Promise<RegisterClientResponse> {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/clientId`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    console.error('Failed to register client', response);
    return {
      success: false,
      message: UNKNOWN_ERROR_MESSAGE,
    };
  }

  const data: { clientId: string } = await response.json();
  setClientId(data.clientId);

  return {
    success: true,
  };
}
