/**
 * FUTURE INTEGRATION SEAM — not used in the frontend phase.
 *
 * The backend phase will implement `JolliFlowService`, `AuthService` and a
 * server-side `PaymentProvider` here. These endpoints do NOT exist yet.
 *
 * Rules for the backend builder:
 * - Never put bank / ALAT / Wema credentials, tokens or signing secrets in browser code.
 * - Payments are initiated server-side; the browser only receives a reference + status.
 * - A payment is "success" only after server-side verification (e.g. webhook + requery).
 * - All money fields are integer kobo.
 */
export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken: () => string | null;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export function createApiClient(config: ApiClientConfig) {
  async function request<T>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown, idempotencyKey?: string): Promise<T> {
    const token = config.getAccessToken();
    const res = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {})
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as {message?: string;code?: string;};
      throw new ApiError(res.status, payload.message ?? res.statusText, payload.code);
    }
    return (await res.json()) as T;
  }
  return { request };
}