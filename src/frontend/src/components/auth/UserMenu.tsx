import { useEffect, useRef, useState } from "react";
import { useAuth, useCurrentUser, useLogoutMutation } from "../../hooks/useAuth";

const chipClass =
  "inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:text-zinc-100 sm:px-4 sm:py-2 sm:text-sm";

export function UserMenu() {
  const { openLogin } = useAuth();
  const currentUser = useCurrentUser();
  const logoutMutation = useLogoutMutation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const user = currentUser.data;
  if (!user) return null;

  if (user.authDisabled) {
    return (
      <span
        title="Login is turned off on this server, so anyone who can open this page can change data."
        className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300"
      >
        Local mode
      </span>
    );
  }

  if (!user.isAuthenticated) {
    return (
      <button type="button" onClick={openLogin} className={chipClass}>
        Log in
      </button>
    );
  }

  const email = user.email ?? "Admin";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={chipClass}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] text-cyan-200">
          {email[0]?.toUpperCase()}
        </span>
        <span className="hidden max-w-48 truncate md:inline">{email}</span>
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-700/70 bg-zinc-900 p-1.5 shadow-xl shadow-black/40"
        >
          <div className="px-3 py-2 text-xs text-zinc-500">
            Signed in as
            <span className="block truncate text-zinc-300">{email}</span>
          </div>
          <button
            type="button"
            role="menuitem"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate(undefined, { onSuccess: () => setOpen(false) })}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {logoutMutation.isPending ? "Logging out…" : "Log out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
