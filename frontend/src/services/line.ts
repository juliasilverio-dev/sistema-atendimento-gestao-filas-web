import type { LineSnapshot, Ticket } from '../types/ticket';
import { request } from './api';
import { parseLine, parseTicket } from './contracts';

export async function getLine(signal?: AbortSignal): Promise<LineSnapshot> {
  const data = await request('/line', { signal: signal });
  return parseLine(data);
}

export async function callNext(): Promise<Ticket | null> {
  const data = await request('/line/next', { method: 'POST' });

  if (data === null) {
    return null;
  }

  return parseTicket(data);
}
