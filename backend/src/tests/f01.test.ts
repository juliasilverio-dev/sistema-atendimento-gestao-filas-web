import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { app } from '../app';
import { validateCreateTicketInput } from '../modules/tickets/tickets.validation';

test('F01: aceita todas as seis combinações de categoria e serviço', () => {
  for (const category of ['normal', 'preferencial']) {
    for (const service of ['consulta', 'exame', 'agendamento']) {
      const input = { category, service };

      assert.deepEqual(validateCreateTicketInput(input), { valid: true, data: input });
    }
  }
});

test('F01: rejeita categorias ausentes, desconhecidas ou múltiplas', () => {
  for (const category of [undefined, null, '', 'urgente', 'Normal', 1, ['normal'], {}]) {
    const result = validateCreateTicketInput({ category, service: 'consulta' });

    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.deepEqual(result.errors.map((error) => error.field), ['category']);
    }
  }
});

test('F01: rejeita serviços ausentes, desconhecidos ou múltiplos', () => {
  for (const service of [undefined, null, '', 'cirurgia', 'Consulta', 1, ['exame'], {}]) {
    const result = validateCreateTicketInput({ category: 'normal', service });

    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.deepEqual(result.errors.map((error) => error.field), ['service']);
    }
  }
});

test('F01: informa os dois campos quando ambos estiverem ausentes', () => {
  const result = validateCreateTicketInput({});

  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.deepEqual(result.errors.map((error) => error.field), ['category', 'service']);
  }
});

test('F01: rejeita corpos que não representam uma escolha de atendimento', () => {
  for (const input of [undefined, null, false, 12, 'normal', [], ['normal', 'consulta']]) {
    const result = validateCreateTicketInput(input);

    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.deepEqual(result.errors.map((error) => error.field), ['body']);
    }
  }
});

test('F01: rejeita campos extras e preserva a entrada recebida', () => {
  const input = Object.freeze({ category: 'normal', service: 'consulta', code: 'K7Q' });
  const result = validateCreateTicketInput(input);

  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.deepEqual(result.errors.map((error) => error.field), ['code']);
  }
  assert.deepEqual(input, { category: 'normal', service: 'consulta', code: 'K7Q' });
});

test('F01: disponibiliza os catálogos HTTP com os códigos e rótulos usados nas telas', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const categories = await fetch(`${baseUrl}/api/categories`);
  assert.equal(categories.status, 200);
  assert.match(categories.headers.get('content-type') ?? '', /application\/json/);
  assert.deepEqual(await categories.json(), {
    data: [
      { code: 'normal', label: 'Normal' },
      { code: 'preferencial', label: 'Preferencial' },
    ],
  });

  const services = await fetch(`${baseUrl}/api/services`);
  assert.equal(services.status, 200);
  assert.deepEqual(await services.json(), {
    data: [
      { code: 'consulta', label: 'Consulta' },
      { code: 'exame', label: 'Exame' },
      { code: 'agendamento', label: 'Agendamento' },
    ],
  });
});
