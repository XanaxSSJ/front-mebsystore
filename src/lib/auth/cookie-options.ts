export function jwtCookieBase(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
} {
  const sameSiteRaw = (process.env.APP_COOKIE_SAME_SITE ?? "Lax").toLowerCase();
  const sameSite: "lax" | "strict" | "none" =
    sameSiteRaw === "none" ? "none" : sameSiteRaw === "strict" ? "strict" : "lax";
  let secure = process.env.APP_COOKIE_SECURE !== "false";
  if (sameSite === "none" && !secure) {
    secure = true;
  }
  const maxAge = Number(process.env.APP_COOKIE_MAX_AGE ?? 86_400);
  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge,
  };
}
