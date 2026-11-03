import { request } from './api';
import { parseLine, parseTicket } from './contracts';

export async function getLine() {
  return parseLine(await request('/line'));
}

export async function callNext() {
  const data = await request('/line/next', { method: 'POST' });
  return data === null ? null : parseTicket(data);
}

export async function completeAttendance(code: string) {
  return parseTicket(await request(`/line/${encodeURIComponent(code)}/complete`, { method: 'POST' }));
}
