import { Platform } from 'react-native';

export const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3333' : 'http://127.0.0.1:3333';

export interface HttpRequestOptions {
  token?: string;
}

export interface HttpClient {
  post<TResponse>(path: string, body: unknown, options?: HttpRequestOptions): Promise<TResponse>;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
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

export function createHttpClient(baseUrl: string): HttpClient {
  return {
    async post<TResponse>(path: string, body: unknown, options?: HttpRequestOptions): Promise<TResponse> {
      const headers: Record<string, string> = { 'content-type': 'application/json' };
      if (options?.token) {
        headers.authorization = `Bearer ${options.token}`;
      }

      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiError(await readMessage(response));
      }

      return (await response.json()) as TResponse;
    },
  };
}

export const httpClient: HttpClient = createHttpClient(API_BASE_URL);
