import { getCurrentTime } from '../../compartilhado/clock';
import type { Clock } from '../../compartilhado/clock';
import { AppError } from '../../compartilhado/erros/app-error';
import { generateTicketCode } from './tickets.generator';
import type { CodeGenerator } from './tickets.generator';
import { TicketsRepository } from './tickets.repository';
import { copyTicket } from './tickets.types';
import { validateCreateTicketInput } from './tickets.validation';
import type { Ticket } from './tickets.types';

export class TicketsService {
  private repository: TicketsRepository;
  private generateCode: CodeGenerator;
  private now: Clock;

  constructor(
    repository: TicketsRepository,
    generateCode: CodeGenerator = generateTicketCode,
    now: Clock = getCurrentTime,
  ) {
    this.repository = repository;
    this.generateCode = generateCode;
    this.now = now;
  }

  create(input: unknown): Ticket {
    // 1. Conferimos a escolha antes de alterar qualquer dado.
    const result = validateCreateTicketInput(input);

    if (!result.valid) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Confira a categoria e o serviço informados.', result.errors);
    }

    // 2. Geramos outro candidato sempre que encontramos um código já usado.
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const code = this.generateCode();
      const codeAlreadyExists = this.repository.hasCode(code);

      if (!codeAlreadyExists) {
        const ticket: Ticket = {
          code: code,
          category: result.data.category,
          service: result.data.service,
          status: 'aguardando',
          issuedAt: this.now().toISOString(),
          calledAt: null,
        };

        // 3. Registramos e inserimos a senha antes de confirmar a emissão.
        // Sem await neste trecho, outra requisição não interrompe a operação
        // no processo único do Node.js.
        this.repository.add(ticket);
        return copyTicket(ticket);
      }
    }

    // Nenhuma senha foi registrada se todas as tentativas falharam.
    throw new AppError(500, 'CODE_GENERATION_FAILED', 'Não foi possível gerar uma senha única. Tente novamente.');
  }
}
