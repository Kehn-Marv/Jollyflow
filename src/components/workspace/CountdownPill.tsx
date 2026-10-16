import React, { useEffect, useState } from 'react';
import { cx } from '../../utils/styles';

const pad = (n: number) => String(n).padStart(2, '0');

/** Live “Days | Hours | Mins” countdown to the event start. */
export function CountdownPill({ startsAt, endsAt, className }: {startsAt: string;endsAt: string;className?: string;}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const base = 'inline-flex items-center rounded-full border border-line bg-white font-mono text-xs text-ink';

  if (now >= end) return <span className={cx(base, 'px-3 py-1.5 text-smoke', className)}>Event ended</span>;
  if (now >= start) {
    return (
      <span className={cx(base, 'gap-1.5 px-3 py-1.5', className)}>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" aria-hidden="true" /> Live now
      </span>);

  }

  const mins = Math.floor((start - now) / 60_000);
  const parts = [
  { v: Math.floor(mins / 1440), l: 'Days' },
  { v: Math.floor(mins % 1440 / 60), l: 'Hours' },
  { v: mins % 60, l: 'Mins' }];


  return (
    <span role="timer" aria-label={`${parts[0].v} days, ${parts[1].v} hours and ${parts[2].v} minutes to go`} className={cx(base, 'divide-x divide-line overflow-hidden', className)}>
      {parts.map((p) =>
      <span key={p.l} className="flex items-baseline gap-1 px-2.5 py-1.5">
          <span className="font-semibold tabular-nums">{pad(p.v)}</span>
          <span className="text-[10px] text-smoke">{p.l}</span>
        </span>
      )}
    </span>);

}