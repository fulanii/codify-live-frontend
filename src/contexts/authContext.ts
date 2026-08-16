import { createContext } from 'react';

import type { LoginRequest, User } from '../types/auth.types';

export interface AuthContextValue {
  user: User | null;
  isBootstrapping: boolean;
  isLoggingIn: boolean;
  // True when a signed-in session ended on its own, rather than the user never
  // having signed in or having signed out deliberately.
  sessionExpired: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  completeGoogleLogin: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
