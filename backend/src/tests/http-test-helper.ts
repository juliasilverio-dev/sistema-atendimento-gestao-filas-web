import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { TestContext } from 'node:test';
import { createApp } from '../app';
import type { AppOptions } from '../app';
import type { LineSnapshot, Ticket } from '../modules/tickets/tickets.types';

interface TicketResponse {
  data: Ticket;
}

interface CallResponse {
  data: Ticket | null;
}

interface LineResponse {
  data: LineSnapshot;
}

interface ErrorResponse {
  error: {
    code: string;
    details?: unknown[];
  };
}

// A preparação HTTP fica aqui para cada teste poder mostrar sua regra com clareza.
export async function createTestApi(testContext: TestContext, options: AppOptions = {}) {
  const app = createApp(options);

  // Porta zero solicita uma porta livre. 127.0.0.1 limita o acesso ao computador.
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  // O servidor deste cenário é encerrado mesmo quando uma verificação falha.
  testContext.after(() => {
    return new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  });

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const base = `http://127.0.0.1:${address.port}/api`;

  async function get(path: string): Promise<Response> {
    return fetch(base + path);
  }

  async function post(path: string, input?: unknown): Promise<Response> {
    let body: string | undefined;

    if (input !== undefined) {
      body = JSON.stringify(input);
    }

    return fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });
  }

  // await espera a resposta da operação antes de continuar o teste.
  async function issue(category: string, service = 'consulta'): Promise<Ticket> {
    const response = await post('/tickets', { category: category, service: service });
    assert.equal(response.status, 201);
    const body = await response.json() as TicketResponse;
    return body.data;
  }

  async function next(): Promise<Ticket | null> {
    const response = await post('/line/next');
    assert.equal(response.status, 200);
    const body = await response.json() as CallResponse;
    return body.data;
  }

  async function snapshot(): Promise<LineSnapshot> {
    const response = await get('/line');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.json() as LineResponse;
    return body.data;
  }

  return { base, get, post, issue, next, snapshot };
}

export async function readError(response: Response): Promise<ErrorResponse> {
  return await response.json() as ErrorResponse;
}
