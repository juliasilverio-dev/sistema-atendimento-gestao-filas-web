import { isCategory, isService } from '../constants/catalog';
import type { LineSnapshot, Ticket } from '../types/ticket';
import { ApiError, isRecord } from './api';

function isDate(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

// O tipo TypeScript não valida dados que chegam pela rede.
// Estas verificações confirmam, uma etapa por vez, os campos de uma senha.
function isTicket(value: unknown): value is Ticket {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.code !== 'string' || value.code.length === 0) {
    return false;
  }

  if (!isCategory(value.category) || !isService(value.service)) {
    return false;
  }

  if (value.status !== 'aguardando' && value.status !== 'chamada') {
    return false;
  }

  if (!isDate(value.issuedAt)) {
    return false;
  }

  if (value.status === 'aguardando') {
    return value.calledAt === null;
  }

  return isDate(value.calledAt);
}

export function parseTicket(value: unknown): Ticket {
  if (!isTicket(value)) {
    throw new ApiError('O serviço retornou dados de senha inválidos.');
  }

  return value;
}

export function parseLine(value: unknown): LineSnapshot {
  const errorMessage = 'O serviço retornou dados de fila inválidos.';

  if (!isRecord(value) || !Array.isArray(value.waiting)) {
    throw new ApiError(errorMessage);
  }

  const waiting: Ticket[] = [];

  for (const ticket of value.waiting) {
    if (!isTicket(ticket) || ticket.status !== 'aguardando') {
      throw new ApiError(errorMessage);
    }

    waiting.push(ticket);
  }

  let current: Ticket | null = null;

  if (value.current !== null) {
    if (!isTicket(value.current) || value.current.status !== 'chamada') {
      throw new ApiError(errorMessage);
    }

    current = value.current;
  }

  return { waiting: waiting, current: current };
}
