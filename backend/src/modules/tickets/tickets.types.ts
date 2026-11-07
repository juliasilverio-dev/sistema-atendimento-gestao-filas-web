import type { ServiceCode } from '../service/service.types';

// A barra vertical significa "ou": a categoria aceita um destes dois textos.
export type TicketCategory = 'normal' | 'preferencial';
export type TicketStatus = 'aguardando' | 'chamada';

interface CategoryOption {
  code: TicketCategory;
  label: string;
}

export const TICKET_CATEGORIES: CategoryOption[] = [
  { code: 'normal', label: 'Normal' },
  { code: 'preferencial', label: 'Preferencial' },
];

// O totem envia somente estas duas escolhas.
export interface CreateTicketInput {
  category: TicketCategory;
  service: ServiceCode;
}

// Uma interface descreve quais informações um objeto precisa ter.
// Código, situação e horários são preenchidos pelo backend.
export interface Ticket {
  code: string;
  category: TicketCategory;
  service: ServiceCode;
  status: TicketStatus;
  issuedAt: string;
  calledAt: string | null;
}

export interface LineSnapshot {
  waiting: Ticket[];
  current: Ticket | null;
}

export function isTicketCategory(value: unknown): value is TicketCategory {
  for (const category of TICKET_CATEGORIES) {
    if (category.code === value) {
      return true;
    }
  }

  return false;
}

// Uma resposta recebe uma cópia, para não poder modificar o registro original.
export function copyTicket(ticket: Ticket): Ticket {
  return {
    code: ticket.code,
    category: ticket.category,
    service: ticket.service,
    status: ticket.status,
    issuedAt: ticket.issuedAt,
    calledAt: ticket.calledAt,
  };
}
