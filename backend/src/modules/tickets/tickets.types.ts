import type { ServiceCode } from '../service/service.types';

export const TICKET_CATEGORIES = [
  { code: 'normal', label: 'Normal' },
  { code: 'preferencial', label: 'Preferencial' },
] as const;

// [number] representa um elemento do catálogo; ['code'] extrai seus códigos.
// O tipo resultante aceita somente 'normal' ou 'preferencial'.
export type TicketCategory = (typeof TICKET_CATEGORIES)[number]['code'];

// Esta é a escolha enviada pelo totem. Código, horários e estado serão
// definidos pelo backend quando a emissão for implementada.
export interface CreateTicketInput {
  category: TicketCategory;
  service: ServiceCode;
}

export function isTicketCategory(value: unknown): value is TicketCategory {
  for (const category of TICKET_CATEGORIES) {
    if (category.code === value) {
      return true;
    }
  }

  return false;
}
