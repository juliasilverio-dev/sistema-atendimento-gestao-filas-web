import { useRef, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Notice } from '../components/ui/Notice';
import { TicketCard } from '../components/tickets/TicketCard';
import { QueueList } from '../components/line/QueueList';
import { useLine } from '../hooks/useLine';
import { errorMessage } from '../services/api';
import { callNext, completeAttendance } from '../services/line';

export function AtendimentoPage() {
  const { line, isLoading, error, refresh } = useLine();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const submitting = useRef(false);

  async function handleAction(action: 'next' | 'complete') {
    if (submitting.current || !line || isLoading) return;
    submitting.current = true;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      if (action === 'next') {
        const ticket = await callNext();
        setFeedback({ message: ticket ? `Senha ${ticket.code} chamada para atendimento.` : 'Não há senhas aguardando.', variant: 'success' });
      } else if (line.current) {
        const ticket = await completeAttendance(line.current.code);
        setFeedback({ message: `Atendimento da senha ${ticket.code} concluído.`, variant: 'success' });
      }
    } catch (cause) {
      setFeedback({ message: errorMessage(cause), variant: 'error' });
    } finally {
      await refresh();
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="03 / ATENDIMENTO" title="Um atendimento por vez"
        description="Chame a próxima senha e conclua o atendimento para liberar uma nova chamada." />
      <div className="toolbar">
        <p>Posto de atendimento · Fila global</p>
        <button className="button secondary" disabled={isLoading || isSubmitting} onClick={() => { setFeedback(null); void refresh(); }}>
          {isLoading ? 'Atualizando…' : 'Atualizar fila'}
        </button>
      </div>
      {error && <Notice message={error} />}
      {feedback && <Notice {...feedback} />}
      {isLoading && <p role="status" className="loading-state">Consultando o posto de atendimento…</p>}
      {line && !isLoading && (
        <div className="content-grid">
          <section className="panel stack" aria-labelledby="attendance-title" aria-busy={isSubmitting}>
            <h2 id="attendance-title">Atendimento atual</h2>
            {line.current ? <TicketCard ticket={line.current} /> : <p className="empty-state">Posto livre. Chame a próxima senha para começar.</p>}
            {line.current ? (
              <button className="button primary" disabled={isSubmitting} onClick={() => { void handleAction('complete'); }}>
                {isSubmitting ? 'Concluindo…' : 'Concluir atendimento'}
              </button>
            ) : (
              <button className="button primary" disabled={isSubmitting || line.waiting.length === 0} onClick={() => { void handleAction('next'); }}>
                {isSubmitting ? 'Chamando…' : 'Chamar próxima senha'}
              </button>
            )}
          </section>
          <section className="panel" aria-labelledby="next-title">
            <h2 id="next-title">Próximas chamadas</h2>
            <QueueList tickets={line.waiting} />
          </section>
        </div>
      )}
    </>
  );
}
