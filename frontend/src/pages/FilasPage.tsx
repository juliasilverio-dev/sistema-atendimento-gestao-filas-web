import { PageHeader } from '../components/ui/PageHeader';
import { Notice } from '../components/ui/Notice';
import { TicketCard } from '../components/tickets/TicketCard';
import { QueueList } from '../components/line/QueueList';
import { useLine } from '../hooks/useLine';

export function FilasPage() {
  const { line, isLoading, error, refresh } = useLine();

  return (
    <>
      <PageHeader eyebrow="02 / PAINEL DE FILAS" title="Acompanhe os atendimentos"
        description="Consulte a senha em atendimento e a ordem das próximas chamadas." />
      <div className="toolbar">
        <p>Preferenciais primeiro · Ordem de emissão em cada categoria</p>
        <button className="button secondary" disabled={isLoading} onClick={() => { void refresh(); }}>
          {isLoading ? 'Atualizando…' : 'Atualizar filas'}
        </button>
      </div>
      {error && <Notice message={error} />}
      {isLoading && <p role="status" className="loading-state">Consultando a fila de atendimento…</p>}
      {line && !isLoading && (
        <div className="content-grid">
          <section className="panel" aria-labelledby="waiting-title">
            <div className="section-heading"><h2 id="waiting-title">Aguardando atendimento</h2><span className="count">{line.waiting.length}</span></div>
            <QueueList tickets={line.waiting} />
          </section>
          <section className="panel" aria-labelledby="current-title">
            <h2 id="current-title">Em atendimento</h2>
            {line.current ? <TicketCard ticket={line.current} /> : <p className="empty-state">Nenhum atendimento em andamento.</p>}
          </section>
        </div>
      )}
    </>
  );
}
