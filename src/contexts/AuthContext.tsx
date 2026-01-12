import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, setAccessToken, getAccessToken, clearAccessToken } from '@/lib/api';
import type { MeResponse, UserLogin, UserRegistration } from '@/types/api';

interface AuthContextType {
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: UserLogin) => Promise<void>;
  register: (data: UserRegistration) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: isInitialized && !!getAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  useEffect(() => {
    // Check for existing token on mount
    const token = getAccessToken();
    setIsInitialized(true);
    
    if (!token) {
      // Try to refresh token from httpOnly cookie
      authApi.refreshToken().then(success => {
        if (success) {
          refetchUser();
        }
      });
    }
  }, [refetchUser]);

  const login = useCallback(async (data: UserLogin) => {
    const response = await authApi.login(data);
    setAccessToken(response.access_token);
    await refetchUser();
  }, [refetchUser]);

  const register = useCallback(async (data: UserRegistration) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAccessToken();
      queryClient.clear();
    }
  }, [queryClient]);

  const deleteAccount = useCallback(async () => {
    try {
      await authApi.deleteAccount();
      // Call logout to ensure cookies are cleared on backend
      try {
        await authApi.logout();
      } catch (logoutError) {
        // Ignore logout errors - account is already deleted
        console.warn('Logout after account deletion failed:', logoutError);
      }
      // Clear tokens and cache
      clearAccessToken();
      queryClient.clear();
      // Redirect will happen via navigation since user is no longer authenticated
    } catch (error) {
      // Re-throw error so it can be handled by the UI
      throw error;
    }
  }, [queryClient]);

  const value: AuthContextType = {
    user: user ?? null,
    isLoading: !isInitialized || isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    deleteAccount,
    refetchUser: () => refetchUser(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
