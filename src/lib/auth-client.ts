import { customSessionClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from '../auth'; // Import the auth instance as a type

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL,
  plugins: [customSessionClient<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession, getSession, $fetch } =
  authClient;
