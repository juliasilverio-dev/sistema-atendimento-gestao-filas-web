import assert from 'node:assert/strict';
import test from 'node:test';
import { TicketsRepository } from '../modules/tickets/tickets.repository';
import { TicketsService } from '../modules/tickets/tickets.service';
import { LineService } from '../modules/atendimento/line.service';
import { generateTicketCode } from '../modules/tickets/tickets.generator';
import { createTestApi, readError } from './http-test-helper';

test('Emissão: aceita as seis combinações e define código, estado e horários', async (t) => {
  const api = await createTestApi(t);
  const codes: string[] = [];
  for (const category of ['normal', 'preferencial']) {
    for (const service of ['consulta', 'exame', 'agendamento']) {
      const ticket = await api.issue(category, service);
      assert.match(ticket.code, /^[A-HJ-NP-Z2-9]{8}$/);
      assert.equal(codes.includes(ticket.code), false);
      codes.push(ticket.code);
      assert.equal(ticket.category, category);
      assert.equal(ticket.service, service);
      assert.equal(ticket.status, 'aguardando');
      assert.equal(ticket.calledAt, null);
      assert.ok(Number.isFinite(Date.parse(ticket.issuedAt)));
    }
  }
  assert.equal((await api.snapshot()).waiting.length, 6);
});

test('Atendimento: prioridade global e FIFO mesmo com horários iguais', async (t) => {
  const sameTime = new Date('2026-11-07T12:00:00.000Z');
  const api = await createTestApi(t, { now: () => sameTime });
  const normalA = await api.issue('normal', 'consulta');
  const preferredA = await api.issue('preferencial', 'exame');
  const normalB = await api.issue('normal', 'agendamento');
  const preferredB = await api.issue('preferencial', 'consulta');
  const expected = [preferredA, preferredB, normalA, normalB];
  const snapshot = await api.snapshot();
  assert.deepEqual(snapshot.waiting, expected);
  assert.deepEqual(await api.snapshot(), snapshot);
  for (const ticket of expected) {
    assert.deepEqual(await api.next(), {
      code: ticket.code,
      category: ticket.category,
      service: ticket.service,
      status: 'chamada',
      issuedAt: ticket.issuedAt,
      calledAt: sameTime.toISOString(),
    });
  }
  assert.deepEqual((await api.snapshot()).waiting, []);
});

test('Atendimento: nova preferencial não substitui a chamada atual e passa à frente da normal', async (t) => {
  const api = await createTestApi(t);
  await api.issue('normal');
  const firstCall = await api.next();
  const normal = await api.issue('normal');
  const preferred = await api.issue('preferencial', 'exame');
  assert.deepEqual((await api.snapshot()).current, firstCall);
  const preferredCall = await api.next();
  assert.ok(preferredCall);
  assert.equal(preferredCall.code, preferred.code);

  const normalCall = await api.next();
  assert.ok(normalCall);
  assert.equal(normalCall.code, normal.code);
});

test('Fila vazia: preserva a última chamada e nunca chama a mesma senha novamente', async (t) => {
  const api = await createTestApi(t);
  assert.equal(await api.next(), null);
  assert.deepEqual(await api.snapshot(), { waiting: [], current: null });
  const ticket = await api.issue('normal');
  const called = await api.next();
  assert.ok(called);
  assert.equal(called.code, ticket.code);
  assert.equal(await api.next(), null);
  assert.deepEqual((await api.snapshot()).current, called);
});

test('Validação HTTP: entradas inválidas e campos do servidor não alteram a fila', async (t) => {
  const api = await createTestApi(t);
  for (const input of [{}, { category: 'normal' }, { service: 'exame' },
    { category: 'urgente', service: 'exame' },
    { category: 'normal', service: 'exame', code: 'CLIENTE' },
    { category: ['normal'], service: 'exame' }]) {
    const response = await api.post('/tickets', input);
    assert.equal(response.status, 400);
    const body = await readError(response);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.details);
    assert.ok(body.error.details.length > 0);
  }
  assert.deepEqual(await api.snapshot(), { waiting: [], current: null });
});

test('HTTP: JSON malformado e rota inexistente recebem erros JSON padronizados', async (t) => {
  const api = await createTestApi(t);
  const invalid = await fetch(`${api.base}/tickets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(invalid.status, 400);
  assert.equal((await readError(invalid)).error.code, 'INVALID_JSON');
  for (const path of ['/missing', '/tickets/abc/complete']) {
    const response = await fetch(`${api.base}${path}`);
    assert.equal(response.status, 404);
    assert.equal((await readError(response)).error.code, 'NOT_FOUND');
  }
});

test('Concorrência: chamadas simultâneas retiram senhas diferentes na ordem correta', async (t) => {
  const api = await createTestApi(t);
  const normal = await api.issue('normal');
  const preferred = await api.issue('preferencial');
  // Promise.all envia as chamadas sem esperar uma terminar para iniciar a outra.
  const results = await Promise.all([api.next(), api.next(), api.next()]);
  const codes: string[] = [];
  let emptyCalls = 0;

  for (const ticket of results) {
    if (ticket === null) {
      emptyCalls += 1;
    } else {
      codes.push(ticket.code);
    }
  }

  assert.equal(codes.length, 2);
  assert.ok(codes.includes(preferred.code));
  assert.ok(codes.includes(normal.code));
  assert.equal(emptyCalls, 1);

  const snapshot = await api.snapshot();
  assert.ok(snapshot.current);
  assert.equal(snapshot.current.code, normal.code);
  assert.equal(snapshot.waiting.length, 0);
});

test('Concorrência: com uma senha, somente uma chamada a recebe', async (t) => {
  const api = await createTestApi(t);
  const ticket = await api.issue('normal');
  const results = await Promise.all([api.next(), api.next()]);
  let successfulCalls = 0;
  let emptyCalls = 0;

  for (const result of results) {
    if (result === null) {
      emptyCalls += 1;
    } else {
      assert.equal(result.code, ticket.code);
      successfulCalls += 1;
    }
  }

  assert.equal(successfulCalls, 1);
  assert.equal(emptyCalls, 1);
});

test('Códigos: colisão simulada em emissões simultâneas não sobrescreve registros', async (t) => {
  const candidates = ['AAAAAAAA', 'AAAAAAAA', 'BBBBBBBB'];
  let index = 0;

  function generateCollidingCodes(): string {
    const code = candidates[index];
    index += 1;
    assert.ok(code, 'O gerador de teste esgotou os candidatos.');
    return code;
  }

  const api = await createTestApi(t, { generateCode: generateCollidingCodes });
  const tickets = await Promise.all([api.issue('normal'), api.issue('normal')]);
  assert.notEqual(tickets[0].code, tickets[1].code);
  assert.equal((await api.snapshot()).waiting.length, 2);
});

test('Códigos: senha já chamada continua reservada e falha não insere registro parcial', async (t) => {
  const api = await createTestApi(t, { generateCode: () => 'AAAAAAAA' });
  await api.issue('normal');
  await api.next();
  const before = await api.snapshot();
  const response = await api.post('/tickets', { category: 'normal', service: 'consulta' });
  assert.equal(response.status, 500);
  assert.equal((await readError(response)).error.code, 'CODE_GENERATION_FAILED');
  assert.deepEqual(await api.snapshot(), before);
});

test('Estado: consultas e respostas não expõem referências mutáveis', () => {
  const repository = new TicketsRepository();
  const tickets = new TicketsService(repository);
  const line = new LineService(repository);
  const issued = tickets.create({ category: 'normal', service: 'exame' });
  const originalCode = issued.code;
  issued.code = 'ALTERADO';
  const snapshot = line.getSnapshot();
  snapshot.waiting[0].code = 'ALTERADO';
  assert.equal(line.getSnapshot().waiting[0].code, originalCode);
  const called = line.callNext();
  assert.ok(called);
  called.code = 'ALTERADO';
  assert.equal(line.getSnapshot().current?.code, originalCode);
});

test('Gerador: produz um código com oito caracteres legíveis', () => {
  for (let index = 0; index < 50; index += 1) {
    assert.match(generateTicketCode(), /^[A-HJ-NP-Z2-9]{8}$/);
  }
});
