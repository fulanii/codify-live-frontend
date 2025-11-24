import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type {
  AuthResponse,
  LoginFormData,
  RegisterFormData,
  User,
} from "@/lib/auth-schema";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { access_token } = await api.refreshToken();
        setAccessToken(access_token);

        // Fetch user info after getting access token
        try {
          const userData = await api.getCurrentUser(access_token);
          setUser(userData);
        } catch (userError) {
          console.error("Failed to fetch user info:", userError);
        }
      } catch (error) {
        console.log("No valid session found");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginFormData) => {
    const response: AuthResponse = await api.login(data);
    setAccessToken(response.access_token);

    // Fetch authoritative user data from backend
    try {
      const userData = await api.getCurrentUser(response.access_token);
      setUser(userData);
    } catch (error) {
      // Fallback to response data if /auth/me fails
      console.warn("Failed to fetch user details, using login response data");
      setUser({
        id: response.user_id,
        email: response.email,
        username: response.email.split("@")[0],
      });
    }
  };

  const register = async (data: RegisterFormData) => {
    await api.register(data);
  };

  const logout = async () => {
    // Call backend to clear refresh token cookie
    try {
      await api.logout(accessToken || undefined);
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    // Clear local state regardless of backend response
    setUser(null);
    setAccessToken(null);
  };

  const refreshAccessToken = async (): Promise<string> => {
    const { access_token } = await api.refreshToken();
    setAccessToken(access_token);

    // Re-fetch user info if we don't have it
    if (!user) {
      try {
        const userData = await api.getCurrentUser(access_token);
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user info after refresh:", error);
      }
    }

    return access_token;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        register,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
