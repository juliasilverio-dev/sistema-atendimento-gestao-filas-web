const apiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message: string, public readonly status = 0) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function request(path: string, options: RequestInit = {}): Promise<unknown> {
  let response: Response;

  try {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    if (options.body) headers.set('Content-Type', 'application/json');

    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao serviço de atendimento. Tente novamente em instantes.');
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('O serviço de atendimento não está disponível para esta operação.', response.status);
  }

  if (!response.ok) {
    const message = isRecord(payload) && isRecord(payload.error)
      && typeof payload.error.message === 'string'
      ? payload.error.message
      : 'Não foi possível realizar a operação. Tente novamente.';
    throw new ApiError(message, response.status);
  }

  if (!isRecord(payload) || !Object.hasOwn(payload, 'data')) {
    throw new ApiError('O serviço retornou uma resposta inesperada.', response.status);
  }

  return payload.data;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Não foi possível realizar a operação.';
}
