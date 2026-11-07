import { Queue } from '../../compartilhado/estruturas-de-dados/queue';
import { copyTicket } from './tickets.types';
import type { Ticket, TicketCategory } from './tickets.types';

// Guarda os dados na memória enquanto o backend está em execução.
// Emissão e atendimento recebem a mesma instância deste repositório.
export class TicketsRepository {
  private records: Ticket[];
  private normalQueue: Queue<Ticket>;
  private preferentialQueue: Queue<Ticket>;
  private current: Ticket | null;

  constructor() {
    this.records = [];
    this.normalQueue = new Queue<Ticket>();
    this.preferentialQueue = new Queue<Ticket>();
    this.current = null;
  }

  // Este método apenas localiza a fila da categoria informada.
  // A regra de qual categoria chamar primeiro fica em LineService.
  private getQueue(category: TicketCategory): Queue<Ticket> {
    if (category === 'preferencial') {
      return this.preferentialQueue;
    }

    return this.normalQueue;
  }

  hasCode(code: string): boolean {
    // Conferimos todos os registros, inclusive senhas que já foram chamadas.
    for (const ticket of this.records) {
      if (ticket.code === code) {
        return true;
      }
    }

    return false;
  }

  add(ticket: Ticket): void {
    const queue = this.getQueue(ticket.category);

    // O registro e o nó apontam para a mesma senha.
    this.records.push(ticket);
    queue.enqueue(ticket);
  }

  isEmpty(category: TicketCategory): boolean {
    const queue = this.getQueue(category);
    return queue.isEmpty();
  }

  call(category: TicketCategory, calledAt: string): Ticket | null {
    const queue = this.getQueue(category);
    const ticket = queue.dequeue();

    if (ticket === null) {
      return null;
    }

    ticket.status = 'chamada';
    ticket.calledAt = calledAt;
    this.current = ticket;

    return copyTicket(ticket);
  }

  getWaiting(category: TicketCategory): Ticket[] {
    const queue = this.getQueue(category);
    const tickets = queue.toArray();
    const copies: Ticket[] = [];

    // A consulta devolve cópias, preservando os registros internos.
    for (const ticket of tickets) {
      copies.push(copyTicket(ticket));
    }

    return copies;
  }

  getCurrent(): Ticket | null {
    if (this.current === null) {
      return null;
    }

    return copyTicket(this.current);
  }
}
