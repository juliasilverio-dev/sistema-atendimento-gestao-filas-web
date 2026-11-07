import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../services/api';
import { getLine } from '../services/line';
import type { LineSnapshot } from '../types/ticket';

export function useLine() {
  // useState guarda informações que devem aparecer na tela.
  const [line, setLine] = useState<LineSnapshot | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // useRef guarda controles entre renderizações, sem provocar uma nova tela.
  const lastRequestNumber = useRef(0);
  const isPageOpen = useRef(false);
  const activeRequest = useRef<AbortController | null>(null);
  const nextRefresh = useRef<number | undefined>(undefined);

  // useCallback mantém a mesma função enquanto a página estiver aberta.
  const refresh = useCallback(async (): Promise<void> => {
    if (!isPageOpen.current) {
      return;
    }

    // 1. Cancelamos o agendamento e a consulta anteriores antes de atualizar.
    clearTimeout(nextRefresh.current);

    if (activeRequest.current !== null) {
      activeRequest.current.abort();
    }

    const requestController = new AbortController();
    activeRequest.current = requestController;

    lastRequestNumber.current += 1;
    const requestNumber = lastRequestNumber.current;
    setIsRefreshing(true);

    try {
      // 2. O backend fornece a fila e a chamada atual na mesma resposta.
      const snapshot = await getLine(requestController.signal);

      // Uma resposta antiga não pode sobrescrever uma consulta mais recente.
      if (isPageOpen.current && lastRequestNumber.current === requestNumber) {
        setLine(snapshot);
        setError(null);
        setUpdatedAt(new Date());
      }
    } catch (cause) {
      if (isPageOpen.current && lastRequestNumber.current === requestNumber) {
        // A última fila confirmada continua visível quando a conexão falha.
        setError(errorMessage(cause));
      }
    } finally {
      if (isPageOpen.current && lastRequestNumber.current === requestNumber) {
        setIsRefreshing(false);

        // 3. Esperamos dois segundos depois da resposta para consultar de novo.
        // Assim uma conexão lenta não acumula requisições.
        nextRefresh.current = window.setTimeout(refresh, 2_000);
      }
    }
  }, []);

  useEffect(() => {
    isPageOpen.current = true;
    refresh();

    // Esta função é executada quando a pessoa sai da página.
    return () => {
      isPageOpen.current = false;
      lastRequestNumber.current += 1;
      clearTimeout(nextRefresh.current);

      if (activeRequest.current !== null) {
        activeRequest.current.abort();
      }
    };
  }, [refresh]);

  // Depois da primeira consulta, as atualizações mantêm a fila na tela.
  const isLoading = line === null && isRefreshing;

  return { line, isLoading, isRefreshing, error, updatedAt, refresh };
}
