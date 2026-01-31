// src/lib/axios.config.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";


export interface ApiError<T = unknown> {
  status: number; // 0 = network/unknown
  message: string;
  data?: T;
  raw?: unknown; // optional: keep original payload for debugging
}

function normalizeServerUrl(raw: string) {
  let url = (raw || "http://localhost:8000").trim();

  // remove trailing slash
  if (url.endsWith("/")) url = url.slice(0, -1);

  // remove trailing "/api" if present
  if (url.endsWith("/api")) url = url.slice(0, -4);

  return url;
}

const SERVER_URL = normalizeServerUrl(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
);

/**
 * General API client: /api/*
 * - courses, lessons, enrollments, payments, notifications, analytics, admin, etc.
 */
export const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * Auth API client: /api/auth/*
 * - register, login, refresh, logout, csrf, current-user, etc.
 */
export const authApi = axios.create({
  baseURL: `${SERVER_URL}/api/auth`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});


// ---------------- Cookie helper ----------------
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + "=([^;]*)")
  );

  return match ? decodeURIComponent(match[1]) : null;
}

// ---------------- Error normalization (shared) ----------------
function extractMessageFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const maybe = payload as Record<string, unknown>;

  // DRF commonly returns {detail: "..."} or sometimes {message: "..."}
  if (typeof maybe.detail === "string" && maybe.detail.trim()) return maybe.detail;
  if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message;

  for (const key of Object.keys(maybe)) {
    const v = maybe[key];

    if (typeof v === "string" && v.trim()) return v;

    if (Array.isArray(v) && v.length > 0) {
      const first = v[0];
      if (typeof first === "string" && first.trim()) return first;
    }
  }

  return null;
}

export function toApiError(err: unknown): ApiError {
  // Axios error path
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0;

    // Network error (no response)
    if (!err.response) {
      return {
        status: 0,
        message: "Network error. Please check your connection and try again.",
        raw: err,
      };
    }

    const payload = err.response.data;
    const msg =
      extractMessageFromPayload(payload) ||
      (status === 401
        ? "Unauthorized. Please login again."
        : status === 403
        ? "You don’t have permission to perform this action."
        : status === 404
        ? "Requested resource was not found."
        : "Something went wrong. Please try again.");

    return { status, message: msg, raw: payload };
  }

  // Non-Axios errors
  if (err instanceof Error) {
    return { status: 0, message: err.message || "Something went wrong.", raw: err };
  }

  return { status: 0, message: "Something went wrong. Please try again.", raw: err };
}

// ---------------- CSRF request interceptor (shared) ----------------
function attachCsrfInterceptor(client: AxiosInstance) {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const method = (config.method || "get").toLowerCase();
    const unsafe = method === "post" || method === "put" || method === "patch" || method === "delete";

    if (unsafe) {
      const csrfToken = getCookie("csrftoken");
      if (csrfToken) {
        config.headers = config.headers || {};
        config.headers["X-CSRFToken"] = csrfToken;
      }
    }

    return config;
  });
}

attachCsrfInterceptor(api);
attachCsrfInterceptor(authApi);

// ---------------- Refresh queue (authApi only) ----------------
interface FailedRequest {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

function processQueue(error: AxiosError | null) {
  for (const p of failedQueue) {
    if (error) p.reject(error);
    else p.resolve();
  }
  failedQueue = [];
}

/* Refresh + retry interceptor ONLY on authApi. */
authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => authApi(originalRequest));
      }

      isRefreshing = true;

      try {
        await authApi.post("/refresh/"); // ✅ correct mount
        await bootstrapCsrf(); // keep CSRF in sync

        isRefreshing = false;
        processQueue(null);

        return authApi(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err as AxiosError);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Bootstrap CSRF token:
 * fetch from auth endpoint and set defaults on BOTH clients
 */
export async function bootstrapCsrf() {
  try {
    const res = await authApi.get("/csrf/");
    const token: string | null =
      res && res.data && typeof (res.data as Record<string, unknown>).csrfToken === "string"
        ? ((res.data as Record<string, unknown>).csrfToken as string)
        : null;

    const fallback = token || getCookie("csrftoken");

    if (fallback) {
      authApi.defaults.headers.common["X-CSRFToken"] = fallback;
      api.defaults.headers.common["X-CSRFToken"] = fallback;
    }

    return fallback;
  } catch {
    return getCookie("csrftoken");
  }
}