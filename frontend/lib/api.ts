/**
 * Minimal API client.
 * - On the server (server components) it calls the NestJS API directly via API_URL.
 * - In the browser it calls same-origin `/api/*`, which next.config.mjs rewrites to the API.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: Record<string, string> = {},
    readonly reference?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const baseUrl = () =>
  typeof window === 'undefined' ? process.env.API_URL ?? 'http://localhost:4000/api' : '/api';

type Query = Record<string, string | number | boolean | undefined | null>;

export function qs(query: Query = {}): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : '';
}

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, {
      method: opts.method ?? 'GET',
      cache: 'no-store',
      signal: opts.signal,
      headers: {
        Accept: 'application/json',
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError('We couldn’t reach the server. Check your connection and try again.', 0);
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data && (Array.isArray(data.message) ? data.message[0] : data.message)) ||
      (res.status >= 500 ? 'Something went wrong on our side. Please try again shortly.' : 'Request failed.');
    throw new ApiError(message, res.status, data?.errors ?? {}, data?.reference);
  }
  return data as T;
}

/** For server components: returns `{ data }` or `{ error }` instead of throwing, so pages can render an error state. */
export async function load<T>(path: string): Promise<{ data: T; error: null } | { data: null; error: ApiError }> {
  try {
    return { data: await api<T>(path), error: null };
  } catch (e) {
    return { data: null, error: e instanceof ApiError ? e : new ApiError('Unexpected error', 0) };
  }
}
