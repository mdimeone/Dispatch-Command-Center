"use client";

import { useActionState } from "react";

type LoginState = { error?: string } | void | undefined;

export function LoginForm({
  action,
  nextPath
}: {
  action: (state: LoginState, formData: FormData) => Promise<{ error?: string } | void>;
  nextPath: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {} as { error?: string });

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={nextPath} />

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Shared password</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
          placeholder="Enter password"
        />
      </label>

      {state?.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
