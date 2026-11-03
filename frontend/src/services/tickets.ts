import type { CreateTicketInput } from '../types/ticket';
import { request } from './api';
import { parseTicket } from './contracts';

export async function createTicket(input: CreateTicketInput) {
  const data = await request('/tickets', { method: 'POST', body: JSON.stringify(input) });
  return parseTicket(data);
}
