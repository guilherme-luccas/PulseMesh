import { Platform } from 'react-native';

const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '');

export const API_BASE_URL =
  configuredUrl || (Platform.OS === 'android' ? 'http://10.0.2.2:3333' : 'http://127.0.0.1:3333');

export interface HttpRequestOptions {
  token?: string;
}

export interface HttpClient {
  get<TResponse>(path: string, options?: HttpRequestOptions): Promise<TResponse>;
  post<TResponse>(path: string, body: unknown, options?: HttpRequestOptions): Promise<TResponse>;
  patch<TResponse>(path: string, body: unknown, options?: HttpRequestOptions): Promise<TResponse>;
  delete<TResponse>(path: string, options?: HttpRequestOptions): Promise<TResponse>;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readMessage(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json();
    if (typeof payload === 'object' && payload !== null && 'message' in payload && typeof payload.message === 'string') {
      return payload.message;
    }
  } catch {
    return 'Falha ao falar com o servidor.';
  }

  return 'Falha ao falar com o servidor.';
}

function authHeaders(options?: HttpRequestOptions): Record<string, string> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options?.token) {
    headers.authorization = `Bearer ${options.token}`;
  }

  return headers;
}

export function createHttpClient(baseUrl: string): HttpClient {
  return {
    async get<TResponse>(path: string, options?: HttpRequestOptions): Promise<TResponse> {
      const response = await fetch(`${baseUrl}${path}`, { headers: authHeaders(options) });
      if (!response.ok) {
        throw new ApiError(await readMessage(response), response.status);
      }

      return (await response.json()) as TResponse;
    },

    async post<TResponse>(path: string, body: unknown, options?: HttpRequestOptions): Promise<TResponse> {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: authHeaders(options),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiError(await readMessage(response), response.status);
      }

      return (await response.json()) as TResponse;
    },

    async patch<TResponse>(path: string, body: unknown, options?: HttpRequestOptions): Promise<TResponse> {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'PATCH',
        headers: authHeaders(options),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiError(await readMessage(response), response.status);
      }

      return (await response.json()) as TResponse;
    },

    async delete<TResponse>(path: string, options?: HttpRequestOptions): Promise<TResponse> {
      const headers: Record<string, string> = {};
      if (options?.token) {
        headers.authorization = `Bearer ${options.token}`;
      }

      const response = await fetch(`${baseUrl}${path}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new ApiError(await readMessage(response), response.status);
      }

      return (await response.json()) as TResponse;
    },
  };
}

export const httpClient: HttpClient = createHttpClient(API_BASE_URL);
