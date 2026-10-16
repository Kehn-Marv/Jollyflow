import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useDb } from '../../contexts/DataContext';
import { images } from '../../data/images';
import { computeInsights } from '../../utils/insights';
import { summariseEvent } from '../../utils/finance';
import { rsvpSummary } from '../../utils/rsvp';
import { daysUntil, fmtDate } from '../../utils/dates';
import { formatNairaCompact } from '../../utils/money';
import { SmartImage } from '../ui/SmartImage';

/** A real slice of the demo wedding workspace, framed like a window rising from the fold. */
export function HeroComposition() {
  const db = useDb();
  const reduce = useReducedMotion();
  const wedding = db.events.find((e) => e.id === 'e_wedding') ?? db.events.find((e) => e.managed);
  if (!wedding) return null;

  const insight = computeInsights(db, new Date(), wedding.id)[0];
  const fin = summariseEvent(db, wedding.id);
  const rsvp = rsvpSummary(db.guests.filter((g) => g.eventId === wedding.id));
  const days = Math.max(0, daysUntil(wedding.startsAt));
  const tasks = db.tasks.filter((t) => t.eventId === wedding.id);
  const done = tasks.filter((t) => t.status === 'done').length;
  const paidPct = fin.paid / Math.max(fin.budget, 1) * 100;
  const committedPct = Math.max(0, fin.committed - fin.paid) / Math.max(fin.budget, 1) * 100;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 w-full max-w-5xl sm:mt-20">
      
      <div className="rounded-t-[34px] border border-b-0 border-white/10 bg-white/[0.04] p-2 pb-0 sm:p-3 sm:pb-0">
        <div className="grid overflow-hidden rounded-t-[26px] bg-paper text-left text-ink md:grid-cols-[1.35fr_1fr]">
          {/* Event cover */}
          <div className="relative min-h-[260px] md:min-h-[420px]">
            <SmartImage priority src={images.hero} alt="A guest dancing under string lights at a Lagos celebration" wrapperClassName="absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 bg-ink/55 p-5 backdrop-blur-md sm:p-6">
              <p className="text-xs text-white/65">{fmtDate(wedding.startsAt)} · {wedding.venue}</p>
              <p className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">{wedding.title}</p>
            </div>
            <span className="absolute right-4 top-4 rounded-full bg-lime px-3 py-1 text-xs font-semibold tabular-nums text-ink">
              {days === 0 ? 'Today' : `${days} days to go`}
            </span>
          </div>

          {/* Live state */}
          <dl className="divide-y divide-line">
            <div className="p-5 sm:p-6">
              <dt className="text-xs text-smoke">Guests</dt>
              <dd className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold tabular-nums">{rsvp.attending}</span>
                <span className="text-sm text-smoke">attending of {rsvp.total} invited</span>
              </dd>
              <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-sand" aria-hidden="true">
                <div className="bg-ink" style={{ width: `${rsvp.attending / Math.max(rsvp.total, 1) * 100}%` }} />
                <div className="bg-ink/25" style={{ width: `${rsvp.pending / Math.max(rsvp.total, 1) * 100}%` }} />
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <dt className="text-xs text-smoke">Budget</dt>
              <dd className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold tabular-nums">{formatNairaCompact(fin.paid)}</span>
                <span className="text-sm text-smoke">paid of {formatNairaCompact(fin.budget)}</span>
              </dd>
              <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-sand" aria-hidden="true">
                <div className="bg-ink" style={{ width: `${paidPct}%` }} />
                <div className="bg-coral" style={{ width: `${committedPct}%` }} />
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <dt className="flex items-center justify-between text-xs text-smoke">
                <span>Next up</span>
                <span className="tabular-nums">{done}/{tasks.length} tasks done</span>
              </dt>
              <dd className="mt-2 flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" aria-hidden="true" />
                <span className="text-sm font-medium leading-snug">{insight ? insight.title : 'Everything is on track'}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <p className="sr-only">Live sample data from the demo wedding workspace.</p>
    </motion.div>);

}