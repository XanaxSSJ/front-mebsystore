import { NextRequest, NextResponse } from "next/server";

function allowedOrigins(): string[] {
  const raw = process.env.APP_CORS_ALLOWED_ORIGINS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get("origin") ?? "";
  const allow = allowedOrigins();
  const allowOrigin =
    allow.length === 0 ? "*" : allow.includes(origin) ? origin : allow[0] ?? "*";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
  if (allowOrigin !== "*") {
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  return headers;
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

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
