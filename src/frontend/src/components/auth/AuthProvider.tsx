import { useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UnauthorizedError } from "../../api/apiClient";
import {
  AuthContext,
  canWrite,
  currentUserKey,
  currentUserQuery,
  LoginRequiredError,
  type AuthContextValue,
} from "../../hooks/useAuth";
import { LoginDialog } from "./LoginDialog";

type LoginPrompt = { action?: string; resolve?: (loggedIn: boolean) => void };

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState<LoginPrompt | null>(null);

  const value = useMemo<AuthContextValue>(() => {
    const ensureLoggedIn = async (action: string) => {
      const user = await queryClient.fetchQuery(currentUserQuery);
      if (canWrite(user)) return;
      const loggedIn = await new Promise<boolean>((resolve) => setPrompt({ action, resolve }));
      if (!loggedIn) throw new LoginRequiredError(`Log in to ${action}.`);
    };

    const withLogin = async <T,>(action: string, run: () => Promise<T>) => {
      await ensureLoggedIn(action);
      try {
        return await run();
      } catch (error) {
        if (!(error instanceof UnauthorizedError)) throw error;
        await queryClient.invalidateQueries({ queryKey: currentUserKey });
        await ensureLoggedIn(action);
        return run();
      }
    };

    return { ensureLoggedIn, withLogin, openLogin: () => setPrompt({}) };
  }, [queryClient]);

  const close = (loggedIn: boolean) => {
    prompt?.resolve?.(loggedIn);
    setPrompt(null);
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {prompt ? <LoginDialog action={prompt.action} onClose={close} /> : null}
    </AuthContext.Provider>
  );
}
