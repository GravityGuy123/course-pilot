import axios, { AxiosError, AxiosRequestConfig } from "axios";

/**
 * Base server URL (no /api at the end)
 * Example: http://localhost:8000
 */
const SERVER_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

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



// ---------------- CSRF request interceptor (shared) ----------------
function attachCsrfInterceptor(client: typeof api) {
  client.interceptors.request.use((config) => {
    const method = (config.method || "get").toLowerCase();
    const unsafe = ["post", "put", "patch", "delete"];

    if (unsafe.includes(method)) {
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
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
}

/**
 * Refresh + retry interceptor ONLY on authApi.
 * NOTE: your refresh endpoint is /api/auth/refresh/ in your Django setup.
 */
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
    const token: string | null = res?.data?.csrfToken || null;

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
