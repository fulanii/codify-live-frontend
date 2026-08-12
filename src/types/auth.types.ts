export interface User {
  id: string;
  name: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  auth_provider: string;
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
