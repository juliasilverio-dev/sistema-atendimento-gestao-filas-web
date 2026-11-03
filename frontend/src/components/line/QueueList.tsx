import { categoryLabels, serviceLabels } from '../../constants/catalog';
import type { Ticket } from '../../types/ticket';

export function QueueList({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return <p className="empty-state">Nenhuma senha aguardando atendimento.</p>;
  }

  return (
    <ol className="queue-list" aria-label="Senhas na ordem de chamada">
      {tickets.map((ticket, index) => (
        <li key={ticket.code}>
          <span className="queue-position" aria-label={`Posição ${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
          <div className="queue-ticket"><strong>{ticket.code}</strong><span>{serviceLabels[ticket.service]}</span></div>
          <span className={`badge badge-${ticket.category}`}>{categoryLabels[ticket.category]}</span>
        </li>
      ))}
    </ol>
  );
}
