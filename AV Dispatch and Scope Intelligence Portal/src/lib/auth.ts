import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getSessionToken, isValidSessionValue } from "@/lib/auth/session";

export function getSharedPassword() {
  return process.env.AUTH_SHARED_PASSWORD?.trim() || "";
}

export function isSessionConfigured() {
  return Boolean(getSessionToken());
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const value = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return isValidSessionValue(value);
}

export async function createSession() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, getSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
