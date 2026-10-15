import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

/**
 * Runs an async action once at a time (prevents double submits),
 * exposes `pending`, and turns thrown errors into toasts.
 */
export function useAsyncAction() {
  const [pending, setPending] = useState(false);
  const running = useRef(false);

  const run = useCallback(async <T,>(fn: () => Promise<T>, opts?: {success?: string;error?: string;}): Promise<T | undefined> => {
    if (running.current) return undefined;
    running.current = true;
    setPending(true);
    try {
      const result = await fn();
      if (opts?.success) toast.success(opts.success);
      return result;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : opts?.error ?? 'Something went wrong. Please try again.');
      return undefined;
    } finally {
      running.current = false;
      setPending(false);
    }
  }, []);

  return { pending, run };
}