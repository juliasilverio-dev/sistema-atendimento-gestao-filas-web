import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../services/api';
import { getLine } from '../services/line';
import type { LineSnapshot } from '../types/ticket';

export function useLine() {
  const [line, setLine] = useState<LineSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentId = ++requestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const snapshot = await getLine();
      if (requestId.current === currentId) setLine(snapshot);
    } catch (cause) {
      if (requestId.current === currentId) {
        setLine(null);
        setError(errorMessage(cause));
      }
    } finally {
      if (requestId.current === currentId) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return () => { requestId.current += 1; };
  }, [refresh]);

  return { line, isLoading, error, refresh };
}
