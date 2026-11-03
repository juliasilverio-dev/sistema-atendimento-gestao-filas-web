import { isCategory, isService } from '../constants/catalog';
import type { LineSnapshot, Ticket } from '../types/ticket';
import { ApiError, isRecord } from './api';

function isDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isTicket(value: unknown): value is Ticket {
  return isRecord(value)
    && typeof value.code === 'string' && value.code.length > 0
    && isCategory(value.category) && isService(value.service)
    && (value.status === 'aguardando' || value.status === 'em_atendimento' || value.status === 'atendida')
    && isDate(value.issuedAt)
    && (value.startedAt === null || isDate(value.startedAt))
    && (value.finishedAt === null || isDate(value.finishedAt));
}

export function parseTicket(value: unknown): Ticket {
  if (!isTicket(value)) throw new ApiError('O serviço retornou dados de senha inválidos.');
  return value;
}

export function parseLine(value: unknown): LineSnapshot {
  if (!isRecord(value) || !Array.isArray(value.waiting)
    || !value.waiting.every(isTicket)
    || !value.waiting.every((ticket) => ticket.status === 'aguardando')
    || !(value.current === null || (isTicket(value.current) && value.current.status === 'em_atendimento'))) {
    throw new ApiError('O serviço retornou dados de fila inválidos.');
  }

  return { waiting: value.waiting, current: value.current };
}
