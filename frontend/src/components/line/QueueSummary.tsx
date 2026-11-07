import type { Ticket } from '../../types/ticket';
import { Icon } from '../ui/Icon';

interface QueueSummaryProps {
  tickets: Ticket[];
}

export function QueueSummary({ tickets }: QueueSummaryProps) {
  let preferential = 0;

  // Contamos a categoria para o resumo visual. A ordem da fila não é alterada.
  for (const ticket of tickets) {
    if (ticket.category === 'preferencial') {
      preferential += 1;
    }
  }

  const total = tickets.length;
  const normal = total - preferential;

  return (
    <div className="summary-grid" aria-label="Resumo da espera">
      <div className="summary-card">
        <span className="summary-icon"><Icon name="users" /></span>
        <div><span>Total em espera</span><strong>{total.toString().padStart(2, '0')}</strong></div>
      </div>
      <div className="summary-card">
        <span className="summary-icon amber"><Icon name="star" /></span>
        <div><span>Preferenciais</span><strong>{preferential.toString().padStart(2, '0')}</strong></div>
      </div>
      <div className="summary-card">
        <span className="summary-icon blue"><Icon name="ticket" /></span>
        <div><span>Normais</span><strong>{normal.toString().padStart(2, '0')}</strong></div>
      </div>
    </div>
  );
}
