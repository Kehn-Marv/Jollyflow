import React from 'react';

/** Lightweight placeholder while a route chunk downloads — no layout jump, no spinner flash. */
export function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <span className="h-1 w-24 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <span className="block h-full w-1/3 animate-[loadbar_1s_ease-in-out_infinite] rounded-full bg-ink/60" />
      </span>
    </div>);

}