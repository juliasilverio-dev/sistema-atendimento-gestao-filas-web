export type TicketCategory = 'normal' | 'preferencial';
export type ServiceCode = 'consulta' | 'exame' | 'agendamento';
export type TicketStatus = 'aguardando' | 'chamada';

export interface Ticket {
  code: string;
  category: TicketCategory;
  service: ServiceCode;
  status: TicketStatus;
  issuedAt: string;
  calledAt: string | null;
}

export interface CreateTicketInput {
  category: TicketCategory;
  service: ServiceCode;
}

export interface LineSnapshot {
  waiting: Ticket[];
  current: Ticket | null;
}
