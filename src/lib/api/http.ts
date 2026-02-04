import { ensureCsrfCookie, getCsrfToken } from "@/lib/api/csrf";

export type ApiErrorShape = {
  status: number;
  message: string;
  raw?: unknown;
};

type ApiRequestOptions = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  apiBaseUrl: string;
  body?: unknown;
  signal?: AbortSignal;
  requiresCsrf?: boolean;
};

async function tryRefresh(apiBaseUrl: string): Promise<boolean> {
  // Refresh endpoint contract from your spec.
  const url = new URL("/api/auth/refresh/", apiBaseUrl).toString();

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  return res.ok;
}

async function readSafeJson(res: Response): Promise<unknown> {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiRequest<T>(opts: ApiRequestOptions): Promise<T> {
  const { method, path, apiBaseUrl, body, signal } = opts;
  const requiresCsrf =
    opts.requiresCsrf ?? (method !== "GET" && method !== "DELETE");

  if (requiresCsrf) {
    await ensureCsrfCookie(apiBaseUrl);
  }

  const url = new URL(path, apiBaseUrl).toString();

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (requiresCsrf) {
    const csrf = getCsrfToken();
    if (csrf) headers["X-CSRFToken"] = csrf; // must be EXACTLY this header name :contentReference[oaicite:6]{index=6}
  }

  const init: RequestInit = {
    method,
    credentials: "include",
    headers,
    signal,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const first = await fetch(url, init);

  // refresh-on-401, retry once
  if (first.status === 401) {
    const refreshed = await tryRefresh(apiBaseUrl);
    if (!refreshed) {
      const raw = await readSafeJson(first);
      throw { status: 401, message: "Unauthorized. Refresh failed.", raw } satisfies ApiErrorShape;
    }

    const second = await fetch(url, init);
    if (!second.ok) {
      const raw = await readSafeJson(second);
      throw {
        status: second.status,
        message: "Request failed after refresh.",
        raw,
      } satisfies ApiErrorShape;
    }
    const data = (await readSafeJson(second)) as T;
    return data;
  }

  if (!first.ok) {
    const raw = await readSafeJson(first);
    const msg =
      (raw && typeof raw === "object" && raw !== null && "detail" in raw && typeof (raw as { detail?: unknown }).detail === "string"
        ? (raw as { detail: string }).detail
        : `Request failed (${first.status})`);

    throw { status: first.status, message: msg, raw } satisfies ApiErrorShape;
  }

  const data = (await readSafeJson(first)) as T;
  return data;
}