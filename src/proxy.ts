import { NextRequest, NextResponse } from "next/server";

function allowedOrigins(): string[] {
  const raw = process.env.APP_CORS_ALLOWED_ORIGINS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const DEFAULT_ALLOW_HEADERS =
  "Content-Type, Authorization, Accept, Origin, X-Requested-With";

function corsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get("origin") ?? "";
  const allow = allowedOrigins();
  const allowOrigin =
    allow.length === 0 ? "*" : allow.includes(origin) ? origin : allow[0] ?? "*";

  const requested = request.headers.get("access-control-request-headers");
  const allowHeaders = requested?.trim() ? requested : DEFAULT_ALLOW_HEADERS;

  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": allowHeaders,
    "Access-Control-Max-Age": "86400",
  };
  if (allowOrigin !== "*") {
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  return headers;
}

export function proxy(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
  }

  const res = NextResponse.next();
  const h = corsHeaders(request);
  for (const [k, v] of Object.entries(h)) {
    res.headers.set(k, v);
  }
  return res;
}

export const config = { matcher: "/api/:path*" };
