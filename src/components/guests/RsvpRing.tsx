import React from 'react';
import type { RsvpSummary } from '../../utils/rsvp';

interface RsvpRingProps {
  summary: RsvpSummary;
  size?: number;
}

/** Donut of attending / pending / declined, with an accessible text summary. */
export function RsvpRing({ summary, size = 140 }: RsvpRingProps) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const total = Math.max(summary.total, 1);
  const segs = [
  { v: summary.attending, color: '#244D27' },
  { v: summary.pending, color: '#FF704F' },
  { v: summary.declined, color: '#CFCBBE' }];

  let offset = 0;
  return (
    <figure className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${summary.attending} attending, ${summary.pending} pending, ${summary.declined} declined`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#ECEAE0" strokeWidth="12" />
        {summary.total > 0 &&
        segs.map((s, i) => {
          const len = s.v / total * c;
          const el = <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="12" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </svg>
      <figcaption className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-3xl font-bold leading-none text-ink">{summary.headcount}</span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-smoke">headcount</span>
      </figcaption>
    </figure>);

}