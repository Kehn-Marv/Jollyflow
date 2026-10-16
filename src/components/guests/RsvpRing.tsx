import React from 'react';
import type { RsvpSummary } from '../../utils/rsvp';

interface RsvpRingProps {
  summary: RsvpSummary;
  size?: number;
}

export const RSVP_COLORS = { attending: '#244D27', pending: '#FF704F', declined: '#CFCBBE' } as const;

/** Donut of attending / pending / declined. A thin ring leaves a roomy centre for the label. */
export function RsvpRing({ summary, size = 140 }: RsvpRingProps) {
  const stroke = 8;
  const r = 50 - stroke / 2 - 1;
  const c = 2 * Math.PI * r;
  const total = Math.max(summary.total, 1);
  const segs = [
  { v: summary.attending, color: RSVP_COLORS.attending },
  { v: summary.pending, color: RSVP_COLORS.pending },
  { v: summary.declined, color: RSVP_COLORS.declined }].
  filter((s) => s.v > 0);
  // Small gaps between segments read cleaner than butted colours
  const gap = segs.length > 1 ? 1.6 : 0;
  const compact = size < 120;
  let offset = 0;

  return (
    <figure className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${summary.headcount} headcount: ${summary.attending} attending, ${summary.pending} pending, ${summary.declined} declined`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#ECEAE0" strokeWidth={stroke} />
        {summary.total > 0 &&
        segs.map((s, i) => {
          const len = Math.max(0, s.v / total * c - gap);
          const el = <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeLinecap="butt" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
          offset += len + gap;
          return el;
        })}
      </svg>
      {/* Caption is inset well inside the ring so text never touches it */}
      <figcaption className="absolute inset-[22%] flex flex-col items-center justify-center text-center">
        <span className={compact ? 'font-display text-2xl font-semibold leading-none tabular-nums text-ink' : 'font-display text-3xl font-semibold leading-none tabular-nums text-ink'}>
          {summary.headcount}
        </span>
        <span className={compact ? 'mt-1 text-[10px] leading-none text-smoke' : 'mt-1.5 text-xs leading-none text-smoke'}>headcount</span>
      </figcaption>
    </figure>);

}