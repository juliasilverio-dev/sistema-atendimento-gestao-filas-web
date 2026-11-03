import type { ServiceCode, TicketCategory, TicketStatus } from '../types/ticket';

export const serviceLabels: Record<ServiceCode, string> = {
  consulta: 'Consulta',
  exame: 'Exame',
  agendamento: 'Agendamento',
};

export const categoryLabels: Record<TicketCategory, string> = {
  normal: 'Normal',
  preferencial: 'Preferencial',
};

export const statusLabels: Record<TicketStatus, string> = {
  aguardando: 'Aguardando',
  em_atendimento: 'Em atendimento',
  atendida: 'Atendida',
};

export function isCategory(value: unknown): value is TicketCategory {
  return value === 'normal' || value === 'preferencial';
}

export function isService(value: unknown): value is ServiceCode {
  return value === 'consulta' || value === 'exame' || value === 'agendamento';
}
