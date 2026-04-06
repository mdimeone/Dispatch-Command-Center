import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { loginAction } from "@/app/login/actions";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await isAuthenticated()) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const nextPath = Array.isArray(resolvedSearchParams.next)
    ? resolvedSearchParams.next[0]
    : resolvedSearchParams.next;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_34%),linear-gradient(180deg,_#f8fbff,_#eef3f8)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2.25rem] border border-slate-900/10 bg-slate-950 px-8 py-10 text-white shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">Shared Team Access</p>
            <h1 className="mt-5 font-display text-5xl leading-tight">
              AV Dispatch
              <br />
              Scope Portal
            </h1>
            <p className="mt-5 max-w-lg text-base text-slate-300">
              Sign in with the shared team password to access dispatch planning, cases, scope drafting, and review workflows.
            </p>
          </div>

          <div className="rounded-[2.25rem] border border-white/70 bg-white/90 p-8 shadow-glow backdrop-blur">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Login</p>
                <p className="text-lg font-semibold text-slate-950">Enter shared password</p>
              </div>
            </div>

            <LoginForm action={loginAction} nextPath={nextPath ?? "/dashboard"} />
          </div>
        </div>
      </div>
    </div>
  );
}
