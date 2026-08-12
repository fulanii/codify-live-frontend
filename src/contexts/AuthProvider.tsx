import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';

import { authService, refreshSession, setAccessToken } from '../services/api';
import type { LoginRequest, User } from '../types/auth.types';
import { AuthContext, type AuthContextValue } from './authContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  /**
   * On mount the access token is always gone (it lives in memory). If the
   * httpOnly refresh cookie is still valid we can silently restore the session.
   */
  useEffect(() => {
    let cancelled = false;

    const restore = async (): Promise<void> => {
      const refreshed = await refreshSession();

      if (refreshed) {
        try {
          const current = await authService.me();
          if (!cancelled) {
            setUser(current);
          }
        } catch {
          if (!cancelled) {
            setAccessToken(null);
          }
        }
      }

      if (!cancelled) {
        setIsBootstrapping(false);
      }
    };

    void restore();

    return () => {
      cancelled = true;
    };
  }, []);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: ({ access_token, ...profile }) => {
      setAccessToken(access_token);
      setUser(profile);
    },
  });

  const login = useCallback(
    async (payload: LoginRequest): Promise<void> => {
      await loginMutation.mutateAsync(payload);
    },
    [loginMutation]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      // Clear locally even if the request failed, so the UI never shows a
      // signed-in state the server no longer honours.
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isBootstrapping,
      isLoggingIn: loginMutation.isPending,
      login,
      logout,
    }),
    [user, isBootstrapping, loginMutation.isPending, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
