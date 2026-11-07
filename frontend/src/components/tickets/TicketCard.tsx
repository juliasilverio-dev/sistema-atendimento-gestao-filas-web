import type { ReactNode } from 'react';
import { categoryLabels, serviceLabels, statusLabels } from '../../constants/catalog';
import type { Ticket } from '../../types/ticket';
import { formatDate } from '../../utils/formatDate';

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  let callTimeContent: ReactNode = null;

  if (ticket.calledAt !== null) {
    callTimeContent = (
      <div>
        <dt>Chamada</dt>
        <dd><time dateTime={ticket.calledAt}>{formatDate(ticket.calledAt)}</time></dd>
      </div>
    );
  }

  return (
    <article className="ticket-card" aria-label={'Senha ' + ticket.code}>
      <div className="ticket-topline">
        <span className="eyebrow">SENHA</span>
        <span className={'badge badge-' + ticket.category}>{categoryLabels[ticket.category]}</span>
      </div>
      <p className="ticket-code">{ticket.code}</p>
      <dl className="ticket-details">
        <div><dt>Serviço</dt><dd>{serviceLabels[ticket.service]}</dd></div>
        <div><dt>Situação</dt><dd>{statusLabels[ticket.status]}</dd></div>
        <div><dt>Emissão</dt><dd><time dateTime={ticket.issuedAt}>{formatDate(ticket.issuedAt)}</time></dd></div>
        {callTimeContent}
      </dl>
    </article>
  );
}
