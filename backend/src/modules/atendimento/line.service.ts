import { getCurrentTime } from '../../compartilhado/clock';
import type { Clock } from '../../compartilhado/clock';
import { TicketsRepository } from '../tickets/tickets.repository';
import type { LineSnapshot, Ticket, TicketCategory } from '../tickets/tickets.types';

export class LineService {
  private repository: TicketsRepository;
  private now: Clock;

  constructor(repository: TicketsRepository, now: Clock = getCurrentTime) {
    this.repository = repository;
    this.now = now;
  }

  getSnapshot(): LineSnapshot {
    const preferentialTickets = this.repository.getWaiting('preferencial');
    const normalTickets = this.repository.getWaiting('normal');
    const waiting: Ticket[] = [];

    // A lista de exibição segue a mesma prioridade usada para chamar.
    for (const ticket of preferentialTickets) {
      waiting.push(ticket);
    }

    for (const ticket of normalTickets) {
      waiting.push(ticket);
    }

    return {
      waiting: waiting,
      current: this.repository.getCurrent(),
    };
  }

  callNext(): Ticket | null {
    let category: TicketCategory;

    // Primeiro escolhemos a categoria. A própria fila preserva a ordem FIFO.
    if (!this.repository.isEmpty('preferencial')) {
      category = 'preferencial';
    } else {
      category = 'normal';
    }

    if (this.repository.isEmpty(category)) {
      // Não alteramos a última chamada quando não há ninguém aguardando.
      return null;
    }

    const calledAt = this.now().toISOString();

    // Escolha, retirada e registro ocorrem sem espera entre as etapas.
    return this.repository.call(category, calledAt);
  }
}
