const configuredApiUrl = import.meta.env.VITE_API_URL || '/api';
// Remove barras no fim do endereço para evitar caminhos como /api//tickets.
const apiUrl = configuredApiUrl.replace(/\/+$/, '');

export class ApiError extends Error {
  public readonly status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Confere se a resposta é um objeto com campos, antes de ler suas propriedades.
export function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object') {
    return false;
  }

  if (value === null || Array.isArray(value)) {
    return false;
  }

  return true;
}

// async/await permite esperar uma resposta HTTP sem bloquear a página.
export async function request(path: string, options: RequestInit = {}): Promise<unknown> {
  let response: Response;

  try {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');

    if (options.body) {
      headers.set('Content-Type', 'application/json');
    }

    // Toda requisição tem um limite de dez segundos.
    const timeoutSignal = AbortSignal.timeout(10_000);
    let signal = timeoutSignal;

    if (options.signal) {
      // A consulta também pode ser cancelada quando a pessoa sai da tela.
      signal = AbortSignal.any([options.signal, timeoutSignal]);
    }

    response = await fetch(apiUrl + path, {
      ...options, // Copia as opções recebidas, como método POST e corpo JSON.
      headers: headers,
      signal: signal,
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
    let message = 'Não foi possível realizar a operação. Tente novamente.';

    if (isRecord(payload) && isRecord(payload.error)) {
      if (typeof payload.error.message === 'string') {
        message = payload.error.message;
      }
    }

    throw new ApiError(message, response.status);
  }

  if (!isRecord(payload) || !Object.hasOwn(payload, 'data')) {
    throw new ApiError('O serviço retornou uma resposta inesperada.', response.status);
  }

  // As rotas da API sempre colocam o resultado de sucesso dentro de data.
  return payload.data;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível realizar a operação.';
}
