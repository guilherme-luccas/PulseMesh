export interface HttpClient {
  post<TResponse>(path: string, body: unknown): Promise<TResponse>;
}

const MOCK_LATENCY_MS = 250;

export function createMockHttpClient(): HttpClient {
  return {
    async post<TResponse>(path: string, body: unknown): Promise<TResponse> {
      await new Promise((resolve) => {
        setTimeout(resolve, MOCK_LATENCY_MS);
      });

      return { ok: true, path, body } as TResponse;
    },
  };
}

export const httpClient: HttpClient = createMockHttpClient();
