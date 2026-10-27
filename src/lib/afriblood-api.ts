/** AfriBlood API foundation. No mock clinical records are generated. */
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').trim();
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export type ApiError = Error & { status?: number; details?: unknown };

/** Override getToken if your existing auth provider uses another storage mechanism. */
export function getToken(): string | null {
  try { return localStorage.getItem('access_token') || localStorage.getItem('token'); }
  catch { return null; }
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
  token: string | null = getToken(),
): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const headers = new Headers(options.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${normalizedPath}`, { ...options, headers });
  } catch (cause) {
    throw Object.assign(new Error('Unable to reach AfriBlood API. Check server, API URL and CORS.'), { cause });
  }
  const contentType = response.headers.get('content-type') || '';
  const body: unknown = response.status === 204 ? null : contentType.includes('application/json')
    ? await response.json()
    : await response.text();
  if (!response.ok) {
    const message = typeof body === 'object' && body !== null && 'message' in body
      ? String((body as { message: unknown }).message)
      : `API request failed (${response.status})`;
    throw Object.assign(new Error(message), { status: response.status, details: body }) as ApiError;
  }
  return body as T;
}

export const afribloodApi = {
  get: <T = unknown>(path: string) => apiRequest<T>(path),
  post: <T = unknown>(path: string, data: unknown) => apiRequest<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T = unknown>(path: string, data: unknown) => apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  put: <T = unknown>(path: string, data: unknown) => apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T = unknown>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};