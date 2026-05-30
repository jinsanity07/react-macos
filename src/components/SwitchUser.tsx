import React, { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (username: string) => void;
};

export default function SwitchUser({ open, onClose, onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&remember_me=true`;
      const res = await fetch("https://o.mkpie.me/login", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body
      });

      // Per contract, only JSON { ok: true } is considered a successful login.
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        setError(`Login failed (${res.status}): unexpected response type`);
        return;
      }

      const data: unknown = await res.json().catch(() => null);
      const isSuccess =
        !!data && typeof data === "object" && (data as { ok?: unknown }).ok === true;

      if (isSuccess) {
        const serverUsername =
          typeof data === "object" &&
          data !== null &&
          typeof (data as { username?: unknown }).username === "string"
            ? (data as { username: string }).username
            : username;

        onSuccess(serverUsername);
        onClose();
      } else {
        setError(`Login failed (${res.status})`);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-[22rem] text-center"
      >
        <div className="mx-auto mb-4 size-22 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_14px_30px_rgba(0,0,0,0.38)]">
          <span className="i-ri:user-3-line text-5xl text-white/90" />
        </div>

        <div className="mb-1 text-[1.3rem] font-medium tracking-[0.01em] text-white">
          Other User
        </div>
        <div className="mb-5 text-xs text-white/75">Log in with your server account</div>

        <div className="overflow-hidden rounded-xl border border-white/20 bg-black/30 backdrop-blur-md shadow-[0_20px_44px_rgba(0,0,0,0.45)]">
          <input
            className="h-11 w-full border-b border-white/15 bg-transparent px-4 text-[0.95rem] text-white outline-none placeholder:text-white/55"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoFocus
            autoComplete="username"
          />
          <div className="grid grid-cols-[1fr_auto] items-center">
            <input
              className="h-11 w-full bg-transparent px-4 text-[0.95rem] text-white outline-none placeholder:text-white/55"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="mr-2 size-8 rounded-full bg-white/18 text-white transition hover:bg-white/28 disabled:cursor-not-allowed disabled:opacity-55"
              disabled={loading}
              aria-label="Sign in"
            >
              <span className="i-ri:arrow-right-line text-base" />
            </button>
          </div>
        </div>

        <div className="mt-3 min-h-5 text-sm text-red-300">{error || "\u00a0"}</div>

        <div className="mt-2 flex items-center justify-center gap-4 text-sm">
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-white/85 transition hover:bg-white/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
            onClick={onClose}
            disabled={loading}
          >
            Back to Guest
          </button>
          <button
            type="submit"
            className="rounded-md border border-white/20 bg-white/10 px-4 py-1.5 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-55"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
