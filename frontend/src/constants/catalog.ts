import type { ServiceCode, TicketCategory } from '../types/ticket';

// Estes objetos traduzem os códigos da API para os nomes exibidos nas telas.
export const serviceLabels = {
  consulta: 'Consulta',
  exame: 'Exame',
  agendamento: 'Agendamento',
};

export const categoryLabels = {
  normal: 'Normal',
  preferencial: 'Preferencial',
};

export const statusLabels = {
  aguardando: 'Aguardando',
  chamada: 'Chamada',
};

export function isCategory(value: unknown): value is TicketCategory {
  return value === 'normal' || value === 'preferencial';
}

export function isService(value: unknown): value is ServiceCode {
  return value === 'consulta' || value === 'exame' || value === 'agendamento';
}
