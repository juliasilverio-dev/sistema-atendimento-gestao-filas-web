import type { ReactNode } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Notice } from '../components/ui/Notice';
import { Icon } from '../components/ui/Icon';
import { TicketCard } from '../components/tickets/TicketCard';
import { QueueList } from '../components/line/QueueList';
import { QueueSummary } from '../components/line/QueueSummary';
import { LineToolbar } from '../components/line/LineToolbar';
import { useLine } from '../hooks/useLine';

export function FilasPage() {
  const { line, isLoading, isRefreshing, error, updatedAt, refresh } = useLine();

  let connectionError = error;
  if (error !== null && line !== null) {
    connectionError = error + ' Exibindo a última consulta confirmada.';
  }

  let currentContent: ReactNode = (
    <div className="empty-state current-empty">
      <span className="empty-icon"><Icon name="panel" size={32} /></span>
      <h3>As chamadas começam aqui</h3>
      <p>A primeira senha chamada aparecerá neste painel.</p>
    </div>
  );

  if (line !== null && line.current !== null) {
    currentContent = <TicketCard ticket={line.current} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="PAINEL DE FILAS"
        title="Cada chamada, um novo cuidado."
        description="Acompanhe sua senha e a ordem das próximas chamadas. O painel se atualiza automaticamente."
      />
      <LineToolbar
        updatedAt={updatedAt} isRefreshing={isRefreshing}
        hasError={Boolean(error)} onRefresh={refresh}
      />
      {connectionError && <Notice message={connectionError} />}
      {isLoading && <p role="status" className="loading-state">Consultando a fila de atendimento…</p>}
      {!line && !isLoading && (
        <div className="panel empty-state">Aguardando conexão com o serviço. A consulta será tentada novamente automaticamente.</div>
      )}
      {/* A condição seguida de && mostra o conteúdo apenas quando há uma fila confirmada. */}
      {line && (
        <>
          <QueueSummary tickets={line.waiting} />
          <div className="line-grid">
            <section className="panel current-panel" aria-labelledby="current-title">
              <div className="section-heading">
                <h2 id="current-title"><Icon name="panel" />Última senha chamada</h2>
                <span className="small-label">CHAMADA ATUAL</span>
              </div>
              <div aria-live="polite" aria-atomic="true">{currentContent}</div>
              <p className="helper-text">Ao ver sua senha, dirija-se ao atendimento para o serviço indicado.</p>
            </section>
            <section className="panel" aria-labelledby="waiting-title">
              <div className="section-heading">
                <h2 id="waiting-title">Próximas chamadas</h2>
                <span className="count">{line.waiting.length}</span>
              </div>
              <p className="section-description">Na ordem de atendimento, com prioridade preferencial.</p>
              <QueueList tickets={line.waiting} />
            </section>
          </div>
        </>
      )}
    </>
  );
}
