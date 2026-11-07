import { isServiceCode } from '../service/service.types';
import { isTicketCategory, type CreateTicketInput } from './tickets.types';

export interface InputIssue {
  field: string;
  message: string;
}

interface ValidTicketInput {
  valid: true;
  data: CreateTicketInput;
}

interface InvalidTicketInput {
  valid: false;
  errors: InputIssue[];
}

// A validação tem dois resultados possíveis: dados válidos ou uma lista de erros.
export type TicketInputValidation = ValidTicketInput | InvalidTicketInput;

interface TicketInputFields {
  category?: unknown;
  service?: unknown;
}

export function validateCreateTicketInput(input: unknown): TicketInputValidation {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return {
      valid: false,
      errors: [{ field: 'body', message: 'Informe um objeto com categoria e serviço.' }],
    };
  }

  // Já sabemos que a entrada é um objeto. Os campos continuam desconhecidos
  // até que as verificações de categoria e serviço sejam concluídas.
  const body = input as TicketInputFields;
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
