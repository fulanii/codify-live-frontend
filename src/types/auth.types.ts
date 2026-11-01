export interface User {
  id: string;
  username: string | null;
  name: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  auth_provider: string;
}

export interface SetUsernameRequest {
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends User {
  access_token: string;
}

export interface RefreshResponse {
  access_token: string;
}

export interface SetPasswordRequest {
  password: string;
  confirm_password: string;
}

/** A single entry from FastAPI's 422 validation error list. */
export interface ValidationErrorItem {
  type: string;
  loc: (string | number)[];
  msg: string;
}

/** FastAPI returns a string for HTTPException and a list for 422. */
export interface ApiErrorBody {
  detail: string | ValidationErrorItem[];
}
