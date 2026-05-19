function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  if (
    typeof window !== "undefined" &&
    window.location?.protocol === "https:" &&
    url.startsWith("http://")
  ) {
    return url.replace(/^http:\/\//i, "https://");
  }
  return url;
}

/** Base URL externa opcional (p. ej. backend legacy). Vacío = mismas rutas `/api/*` en Next.js. */
export const API_BASE_URL = getApiBaseUrl();

export const defaultFetchOptions: RequestInit = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

function buildRequestUrl(endpoint: string): string {
  if (endpoint.startsWith("http")) return endpoint;
  const normalized = endpoint.startsWith("/api/")
    ? endpoint
    : endpoint.startsWith("/")
      ? `/api${endpoint}`
      : `/api/${endpoint}`;

  const base = getApiBaseUrl().replace(/\/$/, "");
  if (!base) return normalized;
  if (base.endsWith("/api")) {
    const suffix = normalized.replace(/^\/api/, "") || "/";
    return base + (suffix.startsWith("/") ? suffix : `/${suffix}`);
  }
  return base + normalized;
}

export type FetchAPIOptions = {
  method?: string;
  body?: unknown;
  errorMessage?: string;
};

export async function fetchAPI<T = unknown>(
  endpoint: string,
  { method = "GET", body, errorMessage = "Error en la solicitud" }: FetchAPIOptions = {},
): Promise<T> {
  const url = buildRequestUrl(endpoint);

  const response = await fetch(url, {
    ...defaultFetchOptions,
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const isObjectPayload = payload !== null && typeof payload === "object";
    const record = isObjectPayload ? (payload as Record<string, string>) : null;
    const message = record
      ? record.error || record.message || `${errorMessage} (${response.status})`
      : `${errorMessage} (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 204) return null as T;

  return response.json() as Promise<T>;
}
