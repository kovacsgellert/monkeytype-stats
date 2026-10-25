import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { canWrite, useCurrentUser } from "../../hooks/useAuth";
import { LoadingSkeleton } from "../LoadingSkeleton";

/** Renders its children only for users who may change data; everyone else goes to the dashboard. */
export function RequireLogin({ children }: { children: ReactNode }) {
  const currentUser = useCurrentUser();
  if (currentUser.isLoading) return <LoadingSkeleton />;
  if (!canWrite(currentUser.data)) return <Navigate to="/" replace />;
  return children;
}
