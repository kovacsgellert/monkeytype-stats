import { createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCurrentUser, login, logout, type CurrentUser, type LoginRequest } from "../api/auth";

export const currentUserKey = ["auth", "me"];

export const currentUserQuery = {
  queryKey: currentUserKey,
  queryFn: fetchCurrentUser,
  staleTime: 1000 * 60,
};

export function useCurrentUser() {
  return useQuery(currentUserQuery);
}

/** True when the user may change data: logged in as admin, or the server runs without auth. */
export function canWrite(user: CurrentUser | undefined) {
  return !!user && (user.authDisabled || user.isAdmin);
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: currentUserKey }),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: currentUserKey }),
  });
}

/** Thrown when a write needs a login and the user closes the login dialog instead. */
export class LoginRequiredError extends Error {}

export interface AuthContextValue {
  /** Resolves once the user may change data, asking them to log in first if needed. */
  ensureLoggedIn: (action: string) => Promise<void>;
  /** Runs a write after ensureLoggedIn; if the session expired meanwhile, asks again and retries once. */
  withLogin: <T>(action: string, run: () => Promise<T>) => Promise<T>;
  openLogin: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
