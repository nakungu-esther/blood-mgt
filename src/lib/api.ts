export const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://euphonious-blancmange-bf924f.netlify.app/"
).replace(/\/$/, "");
export type ApiError = Error & { status?: number };
export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      `Cannot reach backend at ${API_URL}. Check the backend server, address and CORS settings.`,
    );
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const msg = Array.isArray(body.message)
      ? body.message.join("; ")
      : body.message || response.statusText;
    const error = new Error(`${response.status}: ${msg}`) as ApiError;
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
