import { apiRequest } from "./apiClient";

export interface CurrentUser {
  isAuthenticated: boolean;
  email: string | null;
  isAdmin: boolean;
  /** The server runs without any auth; everyone can change data. */
  authDisabled: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export function fetchCurrentUser(): Promise<CurrentUser> {
  return apiRequest<CurrentUser>("/api/auth/me");
}

export function login(request: LoginRequest) {
  return apiRequest<null>("/api/auth/login", { method: "POST", body: request });
}

export function logout() {
  return apiRequest<null>("/api/auth/logout", { method: "POST" });
}
