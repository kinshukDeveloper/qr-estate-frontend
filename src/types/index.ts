// ── USER ─────────────────────────────────────────────────────────────────────
export type UserRole = 'agent' | 'agency_admin' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rera_number?: string;
  role: UserRole;
  profile_photo?: string;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  rera_number?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ── API ───────────────────────────────────────────────────────────────────────
export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}
