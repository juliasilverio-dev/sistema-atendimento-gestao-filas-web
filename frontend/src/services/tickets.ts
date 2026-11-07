import type { CreateTicketInput, Ticket } from '../types/ticket';
import { request } from './api';
import { parseTicket } from './contracts';

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  // JSON.stringify transforma o objeto da escolha no texto enviado à API.
  const body = JSON.stringify(input);
  const data = await request('/tickets', { method: 'POST', body: body });
  return parseTicket(data);
}
