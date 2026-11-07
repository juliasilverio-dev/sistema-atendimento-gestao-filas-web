import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Notice } from '../components/ui/Notice';
import { Icon } from '../components/ui/Icon';
import { TicketCard } from '../components/tickets/TicketCard';
import { QueueList } from '../components/line/QueueList';
import { QueueSummary } from '../components/line/QueueSummary';
import { LineToolbar } from '../components/line/LineToolbar';
import { useLine } from '../hooks/useLine';
import { errorMessage } from '../services/api';
import { callNext } from '../services/line';
import { categoryLabels, serviceLabels } from '../constants/catalog';
import type { Ticket } from '../types/ticket';

interface Feedback {
  message: string;
  variant: 'success' | 'error';
}

export function AtendimentoPage() {
  const { line, isLoading, isRefreshing, error, updatedAt, refresh } = useLine();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const submitting = useRef(false);

  async function handleNext() {
    if (submitting.current) {
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      // O backend decide quem chamar. A previsão da tela não reserva a senha.
      const ticket = await callNext();
      let message = 'Não há senhas aguardando. A última chamada foi preservada.';

      if (ticket !== null) {
        message = 'Senha ' + ticket.code + ' chamada para atendimento.';
      }

      setFeedback({ message: message, variant: 'success' });
    } catch (cause) {
      setFeedback({ message: errorMessage(cause), variant: 'error' });
    } finally {
      // A consulta confirma a fila atual, inclusive se outro atendente agiu.
      await refresh();
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  let next: Ticket | null = null;
  if (line !== null && line.waiting.length > 0) {
    next = line.waiting[0];
  }

  let connectionError = error;
  if (error !== null && line !== null) {
    connectionError = error + ' Exibindo a última consulta confirmada.';
  }

  let currentContent: ReactNode = (
    <div className="empty-state current-empty">
      <span className="empty-icon"><Icon name="users" size={32} /></span>
      <h3>Vamos começar?</h3>
      <p>Chame a primeira senha para iniciar o atendimento.</p>
    </div>
  );

  if (line !== null && line.current !== null) {
    currentContent = <TicketCard ticket={line.current} />;
  }

  let nextContent: ReactNode = <p>Nenhuma senha aguardando no momento.</p>;
  if (next !== null) {
    nextContent = (
      <p>
        <strong>{next.code}</strong>
        <span>{serviceLabels[next.service]} · {categoryLabels[next.category]}</span>
      </p>
    );
  }

  let callLabel = 'Chamar próximo';
  if (isSubmitting) {
    callLabel = 'Chamando…';
  }

  const cannotCall = isSubmitting || next === null || Boolean(error);

  return (
    <>
      <PageHeader
        eyebrow="ÁREA DO ATENDENTE"
        title="Pronto para o próximo cuidado?"
        description="Chame a próxima senha. A prioridade e a ordem de chegada são organizadas automaticamente."
      />
      <LineToolbar
        updatedAt={updatedAt} isRefreshing={isRefreshing || isSubmitting}
        hasError={Boolean(error)} onRefresh={refresh}
      />
      {connectionError && <Notice message={connectionError} />}
      {feedback && <Notice message={feedback.message} variant={feedback.variant} />}
      {isLoading && <p role="status" className="loading-state">Consultando a fila de atendimento…</p>}
      {!line && !isLoading && (
        <div className="panel empty-state">Aguardando conexão com o serviço. A consulta será tentada novamente automaticamente.</div>
      )}
      {line && (
        <>
          <QueueSummary tickets={line.waiting} />
          <div className="line-grid">
            <section className="panel stack" aria-labelledby="attendance-title" aria-busy={isSubmitting}>
              <div className="section-heading">
                <h2 id="attendance-title"><Icon name="panel" />Chamada atual</h2>
                <span className="small-label">ATENDIMENTO</span>
              </div>
              {currentContent}
              <div className="next-preview">
                <span className="eyebrow">PRÓXIMA NA FILA</span>
                {nextContent}
              </div>
              <button className="button primary wide" disabled={cannotCall} onClick={handleNext}>
                <Icon name="users" size={19} />{callLabel}<Icon name="arrow" size={19} />
              </button>
              <p className="action-help">Cada chamada retira uma senha da espera e atualiza o painel. Você pode chamar a próxima quando estiver pronto.</p>
            </section>
            <section className="panel" aria-labelledby="next-title">
              <div className="section-heading">
                <h2 id="next-title">Fila de espera</h2>
                <span className="count">{line.waiting.length}</span>
              </div>
              <p className="section-description">Preferenciais primeiro. Ordem de chegada em cada categoria.</p>
              <QueueList tickets={line.waiting} />
            </section>
          </div>
        </>
      )}
    </>
  );
}
