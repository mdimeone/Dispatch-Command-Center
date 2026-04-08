"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { createSession, getSharedPassword, isSessionConfigured } from "@/lib/auth";

export async function loginAction(
  _prevState: void | { error?: string } | undefined,
  formData: FormData
) {
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/dashboard");
  const normalizedNextPath = nextPath === "/" ? "/dashboard" : nextPath;
  const sharedPassword = getSharedPassword();

  if (!sharedPassword) {
    return {
      error:
        "AUTH_SHARED_PASSWORD is not configured in the server environment (Railway Service Variables)."
    };
  }

  if (!isSessionConfigured()) {
    return {
      error:
        "AUTH_SESSION_SECRET is not configured in the server environment (Railway Service Variables)."
    };
  }

  if (password !== sharedPassword) {
    return { error: "Incorrect shared password." };
  }

  await createSession();
  redirect((isSafeRedirect(normalizedNextPath) ? normalizedNextPath : "/dashboard") as Route);
}

function isSafeRedirect(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}
