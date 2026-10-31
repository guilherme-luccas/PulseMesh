export interface HttpClient {
  post<TResponse>(path: string, body: unknown): Promise<TResponse>;
}

export class BackendUnavailableError extends Error {
  constructor() {
    super('Backend ainda não configurado.');
    this.name = 'BackendUnavailableError';
  }
}

export function createUnconfiguredHttpClient(): HttpClient {
  return {
    post<TResponse>(): Promise<TResponse> {
      return Promise.reject(new BackendUnavailableError());
    },
  };
}

export const httpClient: HttpClient = createUnconfiguredHttpClient();
