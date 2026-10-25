import { useEffect, useState, type FormEvent } from "react";
import { useLoginMutation } from "../../hooks/useAuth";
import { buttonClass, inputClass, primaryButtonClass } from "../ui";

interface LoginDialogProps {
  /** What the user was trying to do, e.g. "create a goal"; shown in the title. */
  action?: string;
  onClose: (loggedIn: boolean) => void;
}

export function LoginDialog({ action, onClose }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLoginMutation();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    loginMutation.mutate({ email: email.trim(), password }, { onSuccess: () => onClose(true) });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose(false);
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-zinc-800/80 bg-zinc-950/95 p-5 shadow-2xl shadow-black/40 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">Admin login</p>
            <h2 id="login-dialog-title" className="mt-1 text-lg font-semibold text-zinc-100">
              {action ? `Log in to ${action}` : "Log in"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onClose(false)}
            className="shrink-0 rounded-full border border-zinc-700/60 bg-zinc-900/60 p-2 text-zinc-400 transition hover:bg-zinc-800/70 hover:text-zinc-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <label className="mt-5 block text-sm text-zinc-400">
          Email
          <input
            type="email"
            autoComplete="username"
            autoFocus
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`${inputClass} mt-1`}
          />
        </label>
        <label className="mt-3 block text-sm text-zinc-400">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${inputClass} mt-1`}
          />
        </label>

        {loginMutation.isError ? (
          <p role="alert" className="mt-3 text-sm text-rose-400">
            {loginMutation.error.message}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => onClose(false)} className={buttonClass}>
            Cancel
          </button>
          <button type="submit" disabled={loginMutation.isPending} className={primaryButtonClass}>
            {loginMutation.isPending ? "Logging in…" : "Log in"}
          </button>
        </div>
      </form>
    </div>
  );
}
