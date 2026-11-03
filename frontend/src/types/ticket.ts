export type TicketCategory = 'normal' | 'preferencial';
export type ServiceCode = 'consulta' | 'exame' | 'agendamento';
export type TicketStatus = 'aguardando' | 'em_atendimento' | 'atendida';

export interface Ticket {
  code: string;
  category: TicketCategory;
  service: ServiceCode;
  status: TicketStatus;
  issuedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface CreateTicketInput {
  category: TicketCategory;
  service: ServiceCode;
}

export interface LineSnapshot {
  waiting: Ticket[];
  current: Ticket | null;
}
