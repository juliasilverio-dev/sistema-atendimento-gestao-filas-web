import { categoryLabels, serviceLabels } from '../../constants/catalog';
import type { Ticket } from '../../types/ticket';

interface QueueListProps {
  tickets: Ticket[];
}

export function QueueList({ tickets }: QueueListProps) {
  if (tickets.length === 0) {
    return <p className="empty-state">Nenhuma senha aguardando atendimento.</p>;
  }

  return (
    <ol className="queue-list" aria-label="Senhas na ordem de chamada">
      {/* map transforma cada senha recebida em uma linha visual. */}
      {tickets.map((ticket, index) => {
        const position = index + 1;
        const categoryClass = 'badge badge-' + ticket.category;

        return (
          <li key={ticket.code}>
            <span className="queue-position" aria-label={'Posição ' + position}>
              {String(position).padStart(2, '0')}
            </span>
            <div className="queue-ticket">
              <strong>{ticket.code}</strong>
              <span>{serviceLabels[ticket.service]}</span>
            </div>
            <span className={categoryClass}>{categoryLabels[ticket.category]}</span>
          </li>
        );
      })}
    </ol>
  );
}
