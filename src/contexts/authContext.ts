import { createContext } from 'react';

import type { LoginRequest, User } from '../types/auth.types';

export interface AuthContextValue {
  user: User | null;
  isBootstrapping: boolean;
  isLoggingIn: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
