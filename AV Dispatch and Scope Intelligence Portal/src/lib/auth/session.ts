export const AUTH_COOKIE_NAME = "av_dispatch_session";

function getRawSessionSecret() {
  return process.env.AUTH_SESSION_SECRET?.trim() ?? "";
}

export function getSessionToken() {
  const secret = getRawSessionSecret();
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "local-prototype-session";
  }

  return "";
}

export function isValidSessionValue(value: string | undefined) {
  const expected = getSessionToken();
  return Boolean(expected) && value === expected;
}
