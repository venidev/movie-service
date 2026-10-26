import { useEffect, useRef, useState } from 'react';

export interface ApiState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

/**
 * Runs `request(signal)` whenever `key` changes, aborting any in-flight call.
 * Previous data is kept while the next request loads to avoid flicker.
 * Pass a null key (or null request) to skip.
 */
export function useApi<T>(
  request: ((signal: AbortSignal) => Promise<T>) | null,
  key: string | null,
): ApiState<T> {
  const active = request !== null && key !== null;
  const [state, setState] = useState<ApiState<T>>({ data: null, error: null, loading: active });

  // Always call the latest closure without making it an effect dependency.
  const requestRef = useRef(request);
  requestRef.current = request;

  useEffect(() => {
    const run = requestRef.current;
    if (!run || key === null) {
      setState({ data: null, error: null, loading: false });
      return undefined;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, error: null, loading: true }));

    run(controller.signal).then(
      (data) => setState({ data, error: null, loading: false }),
      (error: Error) => {
        if (error.name !== 'AbortError') setState({ data: null, error, loading: false });
      },
    );

    return () => controller.abort();
  }, [key]);

  return state;
}
