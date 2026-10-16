import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Closes a menu/drawer whenever the route changes, and when the viewport grows
 * past `minWidth` (where the desktop navigation takes over).
 */
export function useCloseOnNavigate(open: boolean, close: () => void, minWidth = 1024) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash]);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const onChange = (e: MediaQueryListEvent) => e.matches && close();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [open, close, minWidth]);
}