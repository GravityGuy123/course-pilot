function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;

  const parts = document.cookie.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (!part) continue;
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const k = part.slice(0, eqIdx).trim();
    if (k === name) return decodeURIComponent(part.slice(eqIdx + 1));
  }
  return null;
}

/**
 * Django default cookie name is "csrftoken".
 * Your backend explicitly keeps CSRF cookie readable (not HttpOnly). :contentReference[oaicite:4]{index=4}
 */
export function getCsrfToken(): string | null {
  return getCookieValue("csrftoken");
}

/**
 * Ensure CSRF cookie exists by calling GET /api/auth/csrf/
 * This matches your frontend contract (fetch CSRF token first). :contentReference[oaicite:5]{index=5}
 */
export async function ensureCsrfCookie(apiBaseUrl: string): Promise<void> {
  const existing = getCsrfToken();
  if (existing) return;

  const url = new URL("/api/auth/csrf/", apiBaseUrl).toString();

  await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
}