import { Icon } from '../ui/Icon';

interface LineToolbarProps {
  updatedAt: Date | null;
  isRefreshing: boolean;
  hasError: boolean;
  onRefresh: () => void;
}

export function LineToolbar({ updatedAt, isRefreshing, hasError, onRefresh }: LineToolbarProps) {
  let statusClass = 'live-status';
  let statusMessage = 'Atualização automática a cada 2 segundos';

  if (hasError) {
    statusClass = 'live-status offline';
    statusMessage = 'Conexão interrompida · tentando reconectar';
  }

  return (
    <div className="toolbar">
      <span className={statusClass}><span className="status-dot" />{statusMessage}</span>
      <div className="toolbar-actions">
        {updatedAt && <span className="last-update">Última consulta: {updatedAt.toLocaleTimeString('pt-BR')}</span>}
        <button className="button secondary compact" disabled={isRefreshing} onClick={onRefresh}>
          <Icon name="refresh" size={16} />Atualizar
        </button>
      </div>
    </div>
  );
}
