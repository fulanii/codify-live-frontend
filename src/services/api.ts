import type {
  ApiErrorBody,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  User,
} from '../types/auth.types';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * The access token lives in memory only, never in localStorage.
 *
 * A token in localStorage is readable by any script on the page, so a single XSS
 * bug leaks it. Holding it in a module variable means it dies with the tab, and
 * the httpOnly refresh cookie is what restores the session on reload.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/** Thrown for any non-2xx response, carrying the HTTP status for callers. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Flatten FastAPI's two error shapes into one readable message. */
async function toErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;

    if (typeof body.detail === 'string') {
      return body.detail;
    }

    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => item.msg).join(', ');
    }
  } catch {
    // Body was empty or not JSON; fall through to the status text.
  }

  return response.statusText || 'Something went wrong.';
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  /** Skip the automatic refresh-and-retry on 401. */
  skipRetry?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, skipRetry = false } = options;

  const send = async (): Promise<Response> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      // Required for the httpOnly refresh cookie to be sent and stored.
      credentials: 'include',
    });
  };

  let response = await send();

  // An expired access token is recoverable: refresh once, then retry.
  if (response.status === 401 && !skipRetry) {
    const refreshed = await refreshSession();

    if (!refreshed) {
      throw new ApiError(await toErrorMessage(response), response.status);
    }

    response = await send();
  }

  if (!response.ok) {
    throw new ApiError(await toErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Exchange the refresh cookie for a new access token.
 *
 * Concurrent callers share one in-flight request so a burst of 401s produces a
 * single refresh instead of a stampede that would trip reuse detection.
 */
let refreshInFlight: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        setAccessToken(null);
        return false;
      }

      const data = (await response.json()) as RefreshResponse;
      setAccessToken(data.access_token);
      return true;
    } catch {
      setAccessToken(null);
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export const authService = {
  login: (payload: LoginRequest): Promise<LoginResponse> =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      skipRetry: true,
    }),

  logout: (): Promise<void> => request<void>('/auth/logout', { method: 'POST', skipRetry: true }),

  me: (): Promise<User> => request<User>('/auth/me'),

  /**
   * Full-page redirect into the backend's Google authorization-code flow.
   *
   * This is a browser navigation rather than a fetch: the backend needs to issue
   * a 302 to Google's consent screen, and the callback must land on the backend
   * so it can set the httpOnly refresh cookie on its own origin.
   */
  startGoogleLogin: (): void => {
    window.location.href = `${API_URL}/auth/google/start`;
  },
};
