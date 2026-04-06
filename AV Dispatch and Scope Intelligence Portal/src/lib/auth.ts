import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "av_dispatch_session";

function getSessionToken() {
  return process.env.AUTH_SESSION_SECRET?.trim() || "local-prototype-session";
}

export function getSharedPassword() {
  return process.env.AUTH_SHARED_PASSWORD?.trim() || "";
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value === getSessionToken();
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
