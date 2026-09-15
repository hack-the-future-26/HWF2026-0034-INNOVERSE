import { useState, useEffect, useCallback } from 'react';
import { HealthResponse, ApiState } from '../types/health';
import { checkHealth } from '../services/api';

export const useHealthCheck = () => {
  const [state, setState] = useState<ApiState<HealthResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const [latency, setLatency] = useState<number | null>(null);

  const fetchHealth = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const startTime = performance.now();
    try {
      const data = await checkHealth();
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setState({ data, loading: false, error: null });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to backend service';
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return { ...state, latency, refetch: fetchHealth };
};
