import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';

import {
  authService,
  getAccessToken,
  getStoredUser,
  hasValidAccessToken,
  refreshSession,
  setAccessToken,
  setSessionExpiredHandler,
  setStoredUser,
} from '../services/api';
import type { LoginRequest, User } from '../types/auth.types';
import { AuthContext, type AuthContextValue } from './authContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  // Seeded from the cached profile so the very first render already reflects
  // the signed-in state, rather than showing a signed-out UI that corrects
  // itself once the network catches up.
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // api.ts detects the expiry, wherever it happens; the provider only reacts.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setSessionExpired(true);
    });

    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

  /**
   * Restore the session on mount.
   *
   * A stored access token that has not expired is reused as-is, so a reload
   * costs nothing on the auth server. Only when it has expired do we spend the
   * refresh cookie on a new one.
   *
   * No stored token at all means nobody has signed in on this browser, so there
   * is no refresh cookie to trade and the request is skipped. The cookie is
   * httpOnly and unreadable, so the token is the only signal we have that a
   * session might exist.
   */
  useEffect(() => {
    let cancelled = false;

    const restore = async (): Promise<void> => {
      const authenticated =
        hasValidAccessToken() || (getAccessToken() !== null && (await refreshSession()));

      if (authenticated) {
        try {
          const current = await authService.me();
          setStoredUser(current);
          if (!cancelled) {
            setUser(current);
          }
        } catch {
          // The cached profile was stale — the session is actually over.
          setAccessToken(null);
          if (!cancelled) {
            setUser(null);
          }
        }
      } else {
        setAccessToken(null);
        if (!cancelled) {
          setUser(null);
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
      setStoredUser(profile);
      setUser(profile);
      setSessionExpired(false);
    },
  });

  const login = useCallback(
    async (payload: LoginRequest): Promise<void> => {
      await loginMutation.mutateAsync(payload);
    },
    [loginMutation]
  );

  // Called only by the Google callback route, where the backend has just set a
  // fresh refresh cookie. The refresh is unconditional because this browser may
  // have no stored token at all, which is the case the mount effect skips.
  const completeGoogleLogin = useCallback(async (): Promise<boolean> => {
    const refreshed = await refreshSession();

    if (!refreshed) {
      return false;
    }

    try {
      const current = await authService.me();
      setStoredUser(current);
      setUser(current);
      setSessionExpired(false);
      return true;
    } catch {
      setAccessToken(null);
      setUser(null);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      // Clear locally even if the request failed, so the UI never shows a
      // signed-in state the server no longer honours.
      setAccessToken(null);
      setUser(null);
      // Signing out deliberately is not an expiry, so no warning next visit.
      setSessionExpired(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isBootstrapping,
      isLoggingIn: loginMutation.isPending,
      sessionExpired,
      login,
      logout,
      completeGoogleLogin,
    }),
    [
      user,
      isBootstrapping,
      loginMutation.isPending,
      sessionExpired,
      login,
      logout,
      completeGoogleLogin,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
