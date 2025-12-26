import type {
  UserRegistration,
  UserRegistrationResponse,
  UserLogin,
  UserLoginResponse,
  AccessTokenResponse,
  MeResponse,
  FriendsSearchResponse,
  FriendRequestResponse,
  AcceptFriendRequestResponse,
  DeclineFriendRequestResponse,
  CancelFriendRequestResponse,
  RemoveFriendResponse,
  GetConversationsResponse,
  CreateDirectConversationResponse,
  GetMessagesResponse,
  SendMessageResponse,
  ConversationParticipantInfo,
  ApiError,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Store for the access token
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = localStorage.getItem('access_token');
  }
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem('access_token');
};

// Request deduplication
const pendingRequests = new Map<string, Promise<unknown>>();

const getRequestKey = (url: string, options?: RequestInit) => {
  return `${options?.method || 'GET'}:${url}`;
};

// Error parsing helper
const parseError = async (response: Response): Promise<string> => {
  try {
    const data: ApiError = await response.json();
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail.map(d => d.msg).join(', ');
    }
    return 'An error occurred';
  } catch {
    return response.statusText || 'An error occurred';
  }
};

// Fetch wrapper with auth and error handling
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {},
  skipDedup = false
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const requestKey = getRequestKey(url, options);

  // Check for pending duplicate request (only for GET)
  if (!skipDedup && options.method !== 'POST' && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey) as Promise<T>;
  }

  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const fetchPromise = (async () => {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // For httpOnly cookies
    });

    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        const newToken = getAccessToken();
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });

        if (!retryResponse.ok) {
          const error = await parseError(retryResponse);
          throw new Error(error);
        }

        return retryResponse.json();
      } else {
        clearAccessToken();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    if (!response.ok) {
      const error = await parseError(response);
      throw new Error(error);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  })();

  // Store pending request for deduplication
  if (!skipDedup && options.method !== 'POST') {
    pendingRequests.set(requestKey, fetchPromise);
    fetchPromise.finally(() => {
      pendingRequests.delete(requestKey);
    });
  }

  return fetchPromise;
};

// Token refresh
let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
  // Prevent multiple simultaneous refresh requests
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/access`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const data: AccessTokenResponse = await response.json();
      setAccessToken(data.access_token);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Auth API
export const authApi = {
  register: (data: UserRegistration) =>
    apiFetch<UserRegistrationResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  login: (data: UserLogin) =>
    apiFetch<UserLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }, true),

  getMe: () =>
    apiFetch<MeResponse>('/auth/me'),

  refreshToken: refreshAccessToken,
};

// Friends API
export const friendsApi = {
  search: (username: string, signal?: AbortSignal) =>
    apiFetch<FriendsSearchResponse>(`/friends/search/${encodeURIComponent(username)}`, { signal }),

  sendRequest: (receiverUsername: string) =>
    apiFetch<FriendRequestResponse>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ receiver_username: receiverUsername }),
    }, true),

  acceptRequest: (senderId: string) =>
    apiFetch<AcceptFriendRequestResponse>('/friends/request/accept', {
      method: 'POST',
      body: JSON.stringify({ sender_id: senderId }),
    }, true),

  declineRequest: (senderId: string) =>
    apiFetch<DeclineFriendRequestResponse>(`/friends/request/decline/${senderId}`, {
      method: 'DELETE',
    }, true),

  cancelRequest: (receiverId: string) =>
    apiFetch<CancelFriendRequestResponse>(`/friends/request/cancel/${receiverId}`, {
      method: 'DELETE',
    }, true),

  removeFriend: (userId: string) =>
    apiFetch<RemoveFriendResponse>(`/friends/remove/${userId}`, {
      method: 'DELETE',
    }, true),
};

// Chat API
export const chatApi = {
  getConversations: () =>
    apiFetch<GetConversationsResponse>('/chat/conversations'),

  getOrCreateDirectConversation: (receiverId: string) =>
    apiFetch<CreateDirectConversationResponse>('/chat/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId }),
    }, true),

  getMessages: (conversationId: string) =>
    apiFetch<GetMessagesResponse>(`/chat/messages/${conversationId}`),

  sendMessage: (conversationId: string, content: string) =>
    apiFetch<SendMessageResponse>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId, content }),
    }, true),

  getParticipantInfo: (conversationId: string) =>
    apiFetch<ConversationParticipantInfo>(`/chat/conversation/participants/${conversationId}`),
};
