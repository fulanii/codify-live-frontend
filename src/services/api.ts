import type {
  ApiErrorBody,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  User,
} from '../types/auth.types';

const API_URL = import.meta.env.VITE_API_URL;

const ACCESS_TOKEN_KEY = 'codifylive.access_token';

/**
 * Treat a token as expired slightly early, so one that dies in flight does not
 * come back as a 401 we then have to recover from.
 */
const EXPIRY_SKEW_SECONDS = 10;

interface AccessTokenClaims {
  exp?: number;
}

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * The access token is persisted so a page reload reuses it instead of spending a
 * refresh. Refreshing rotates the server's refresh token — a new row inserted
 * and the old one revoked — so refreshing on every load would churn that table
 * for no reason.
 */
let accessToken: string | null = readStoredToken();

export function setAccessToken(token: string | null): void {
  accessToken = token;

  try {
    if (token === null) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } else {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  } catch {
    // Storage can be unavailable (private mode, disabled cookies). The
    // in-memory copy still works for the life of the tab.
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Read `exp` out of the JWT payload.
 *
 * The signature is not checked here — that is the server's job, and it will
 * still reject anything forged. This only decides whether it is worth sending.
 */
function getExpiry(token: string): number | null {
  const payload = token.split('.')[1];

  if (payload === undefined) {
    return null;
  }

  try {
    const claims = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    ) as AccessTokenClaims;

    return typeof claims.exp === 'number' ? claims.exp : null;
  } catch {
    return null;
  }
}

const USER_KEY = 'codifylive.user';

/**
 * The last known profile, so the first paint after a reload already knows
 * whether someone is signed in instead of waiting on a round trip.
 *
 * Only returned when a token is also stored — without one the session is
 * definitely over and the cached profile is meaningless. It is a display hint
 * that gets replaced by whatever `/auth/me` says; every protected request is
 * still authorised by the server.
 */
export function getStoredUser(): User | null {
  if (accessToken === null) {
    return null;
  }

  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw === null ? null : (JSON.parse(raw) as User);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  try {
    if (user === null) {
      localStorage.removeItem(USER_KEY);
    } else {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch {
    // Storage unavailable; the in-memory state in AuthProvider still works.
  }
}

/** True when a stored token exists and has not reached its `exp`. */
export function hasValidAccessToken(): boolean {
  if (accessToken === null) {
    return false;
  }

  const expiresAt = getExpiry(accessToken);

  if (expiresAt === null) {
    return false;
  }

  return Date.now() / 1000 < expiresAt - EXPIRY_SKEW_SECONDS;
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

  // A token we already know is expired is replaced up front, rather than spending
  // a round trip to be told 401.
  if (accessToken !== null && !hasValidAccessToken()) {
    await refreshSession();
  }

  let response = await send();

  // Anything the expiry check missed — a revoked token, a rotated signing key —
  // is still recoverable: refresh once, then retry.
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

type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

// Lets AuthProvider hear about a session ending anywhere — a background fetch,
// a retry after a 401 — not just on the paths it drives itself.
export function setSessionExpiredHandler(handler: SessionExpiredHandler | null): void {
  sessionExpiredHandler = handler;
}

export function refreshSession(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  // A refresh with no token behind it is a first sign-in, not an expiry. Only
  // the failure of an established session is worth telling the user about.
  const hadSession = accessToken !== null;

  refreshInFlight = (async (): Promise<boolean> => {
    const fail = (): boolean => {
      setAccessToken(null);

      if (hadSession) {
        sessionExpiredHandler?.();
      }

      return false;
    };

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return fail();
      }

      const data = (await response.json()) as RefreshResponse;
      setAccessToken(data.access_token);
      return true;
    } catch {
      return fail();
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
    window.location.href = `${API_URL}/auth/login/google`;
  },
};
