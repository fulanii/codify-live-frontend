import type {
  RegisterFormData,
  LoginFormData,
  AuthResponse,
  User,
  Friend,
  FriendSearchResult,
  OutgoingFriendRequest,
  IncomingFriendRequest,
  FullProfileResponse,
} from "@/lib/auth-schema";

// Backend API base URL
const API_BASE_URL = "http://localhost:8000";

class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  async register(data: RegisterFormData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Registration failed" }));
      throw new ApiError(
        error.message || error.detail || "Registration failed",
        response.status,
        error
      );
    }

    return response.json();
  },

  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Login failed" }));
      throw new ApiError(
        error.message || error.detail || "Login failed",
        response.status,
        error
      );
    }

    return response.json();
  },

  async refreshToken(): Promise<{ access_token: string; expires_in: number }> {
    const response = await fetch(`${API_BASE_URL}/auth/access`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new ApiError("Token refresh failed", response.status);
    }

    return response.json();
  },

  async getCurrentUser(accessToken: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new ApiError("Failed to get user info", response.status);
    }

    const data = await response.json();
    return {
      id: data.auth?.id ?? "",
      email: data.auth?.email ?? "",
      username: data.profile?.username ?? "",
    };
  },

  async logout(accessToken?: string): Promise<void> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers,
      credentials: "include",
    });

    // Don't throw on error - we want to clear local state regardless
  },

  async fetchWithAuth(
    url: string,
    accessToken: string,
    options: RequestInit = {}
  ) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });

    return response;
  },

  async getFullProfile(accessToken: string): Promise<FullProfileResponse> {
    const response = await this.fetchWithAuth("/auth/me", accessToken, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.message || "Failed to fetch profile",
        response.status,
        error
      );
    }

    return response.json();
  },

  async searchUsers(
    prefix: string,
    accessToken: string
  ): Promise<FriendSearchResult[]> {
    const response = await this.fetchWithAuth(
      `/friends/search/${encodeURIComponent(prefix)}`,
      accessToken,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.message || "Failed to search users",
        response.status,
        error
      );
    }

    const data = await response.json();
    return data.usernames as FriendSearchResult[];
  },

  async sendFriendRequest(
    receiverUsername: string,
    accessToken: string
  ): Promise<OutgoingFriendRequest> {
    const response = await this.fetchWithAuth("/friends/request", accessToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ receiver_username: receiverUsername }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.message || "Failed to send friend request",
        response.status,
        error
      );
    }

    const data = await response.json();
    return {
      receiverId: data.request.receiver_id,
      receiverUsername: receiverUsername,
      createdAt: data.request.created_at,
    };
  },

  async acceptFriendRequest(
    senderId: string,
    accessToken: string
  ): Promise<void> {
    const response = await this.fetchWithAuth("/friends/request/accept", accessToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sender_id: senderId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.message || "Failed to accept friend request",
        response.status,
        error
      );
    }
  },
};
