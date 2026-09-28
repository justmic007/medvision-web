// API client — the single seam between the frontend and the FastAPI backend.
//
// Auth model (httpOnly cookie pattern):
//   - The refresh token lives in an httpOnly cookie the browser sends
//     automatically (we set credentials: "include").
//   - The access token is held in memory here (never in localStorage), attached
//     as a Bearer header. On a 401 we transparently refresh once and retry.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// --- In-memory access token ---
let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

type Options = Omit<RequestInit, "body"> & { body?: unknown };

// Endpoints that must NOT trigger the refresh-retry loop (to avoid recursion).
const NO_RETRY = ["/auth/login", "/auth/refresh", "/auth/register"];

async function request<T>(path: string, options: Options, retry: boolean): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: "include", // send/receive the httpOnly refresh cookie
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // On 401, try to refresh the access token once, then retry the original call.
  if (res.status === 401 && retry && !NO_RETRY.includes(path)) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, options, false); // retry once, no further retry
    }
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch {
      // not JSON
    }
    throw new ApiError(res.status, detail);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

// Attempt to mint a new access token from the httpOnly refresh cookie.
async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { access_token: string };
    accessToken = data.access_token;
    return true;
  } catch {
    return false;
  }
}

export function api<T>(path: string, options: Options = {}): Promise<T> {
  return request<T>(path, options, true);
}

export function getHealth() {
  return api<{ status: string; app: string; version: string }>("/health");
}


// Multipart upload (for /analyze). FormData sets its own Content-Type boundary,
// so we must NOT set Content-Type ourselves. Reuses the access token + refresh.
async function requestForm<T>(
  path: string,
  form: FormData,
  retry: boolean
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: form,
  });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return requestForm<T>(path, form, false);
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch {
      // not JSON
    }
    throw new ApiError(res.status, detail);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export function apiUpload<T>(path: string, form: FormData): Promise<T> {
  return requestForm<T>(path, form, true);
}


// Fetch a binary resource (e.g. a stored scan) with auth, returning a Blob.
// Refreshes the access token once on 401, like the JSON path.
export async function apiBlob(path: string, retry = true): Promise<Blob> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return apiBlob(path, false);
  }
  if (!res.ok) {
    throw new ApiError(res.status, res.statusText);
  }
  return res.blob();
}