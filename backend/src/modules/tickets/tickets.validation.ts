import { isServiceCode } from '../service/service.types';
import { isTicketCategory, type CreateTicketInput } from './tickets.types';

export interface InputIssue {
  field: string;
  message: string;
}

// A propriedade `valid` permite distinguir uma entrada validada de uma lista
// de erros, sem lançar uma exceção para um erro esperado de preenchimento.
export type TicketInputValidation =
  | { valid: true; data: CreateTicketInput }
  | { valid: false; errors: InputIssue[] };

export function validateCreateTicketInput(input: unknown): TicketInputValidation {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return {
      valid: false,
      errors: [{ field: 'body', message: 'Informe um objeto com categoria e serviço.' }],
    };
  }

  // A asserção permite inspecionar as propriedades; seus valores ainda são
  // `unknown` e só serão aceitos depois das verificações abaixo.
  const body = input as Record<string, unknown>;
  const errors: InputIssue[] = [];

  for (const field of Object.keys(body)) {
    if (field !== 'category' && field !== 'service') {
      errors.push({ field, message: 'Campo não permitido na escolha do atendimento.' });
    }
  }

  const category = body.category;
  const service = body.service;

  if (!isTicketCategory(category)) {
    errors.push({ field: 'category', message: 'Selecione normal ou preferencial.' });
  }

  if (!isServiceCode(service)) {
    errors.push({ field: 'service', message: 'Selecione consulta, exame ou agendamento.' });
  }

  // Não há restrição entre as opções: as duas categorias aceitam os três serviços.
  if (errors.length === 0 && isTicketCategory(category) && isServiceCode(service)) {
    return { valid: true, data: { category, service } };
  }

  return { valid: false, errors };
}
