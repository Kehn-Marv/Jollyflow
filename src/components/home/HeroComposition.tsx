import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertOctagon, CalendarCheck, Wallet } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { images } from '../../data/images';
import { computeInsights } from '../../utils/insights';
import { summariseEvent } from '../../utils/finance';
import { rsvpSummary } from '../../utils/rsvp';
import { formatNaira, formatNairaCompact } from '../../utils/money';

/** Live product fragments floating over the hero photo — real data from the demo wedding. */
export function HeroComposition() {
  const db = useDb();
  const reduce = useReducedMotion();
  const wedding = db.events.find((e) => e.id === 'e_wedding') ?? db.events.find((e) => e.managed);
  const insight = wedding ? computeInsights(db, new Date(), wedding.id)[0] : undefined;
  const fin = wedding ? summariseEvent(db, wedding.id) : null;
  const rsvp = wedding ? rsvpSummary(db.guests.filter((g) => g.eventId === wedding.id)) : null;

  const float = (delay: number) =>
  reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.5, ease: 'easeOut' as const } };

  return (
    <div className="relative mx-auto h-[480px] w-full max-w-[560px] sm:h-[560px]">
      <div className="absolute inset-y-0 right-0 w-[86%] rounded-[2rem] border-2 border-paper/10 bg-coral" aria-hidden="true" />
      <div className="absolute bottom-6 right-5 top-6 w-[74%] overflow-hidden rounded-[1.6rem] border-2 border-ink">
        <img src={images.hero} alt="A guest dancing under string lights at a Lagos celebration" className="h-full w-full object-cover" />
      </div>

      {insight &&
      <motion.div {...float(0.25)} className="absolute left-0 top-8 w-[78%] max-w-[300px] rounded-2xl border-2 border-ink bg-white p-3.5 text-ink shadow-pop sm:top-12">
          <div className="flex items-start gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-coral">
              <AlertOctagon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-coral">Needs attention</p>
              <p className="text-sm font-semibold leading-snug">{insight.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-smoke">{insight.detail}</p>
            </div>
          </div>
        </motion.div>
      }

      {rsvp &&
      <motion.div {...float(0.45)} className="absolute bottom-20 left-2 w-[56%] max-w-[230px] rounded-2xl border-2 border-ink bg-sky p-3.5 text-ink shadow-pop sm:bottom-24">
          <p className="flex items-center gap-1.5 text-xs font-semibold"><CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" /> RSVPs</p>
          <p className="mt-1 font-display text-3xl font-bold leading-none">{rsvp.attending}<span className="text-base font-semibold"> attending</span></p>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/60" aria-hidden="true">
            <div className="bg-forest" style={{ width: `${rsvp.attending / Math.max(rsvp.total, 1) * 100}%` }} />
            <div className="bg-coral" style={{ width: `${rsvp.pending / Math.max(rsvp.total, 1) * 100}%` }} />
          </div>
          <p className="mt-1.5 text-xs">{rsvp.pending} pending · {rsvp.declined} declined</p>
        </motion.div>
      }

      {fin &&
      <motion.div {...float(0.65)} className="absolute bottom-2 right-0 w-[58%] max-w-[250px] rounded-2xl border-2 border-ink bg-lime p-3.5 text-ink shadow-pop">
          <p className="flex items-center gap-1.5 text-xs font-semibold"><Wallet className="h-3.5 w-3.5" aria-hidden="true" /> Wedding budget</p>
          <p className="mt-1 font-display text-2xl font-bold leading-none">{formatNairaCompact(fin.budget)}</p>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-white/70" aria-hidden="true">
            <div className="bg-ink" style={{ width: `${fin.paid / Math.max(fin.budget, 1) * 100}%` }} />
            <div className="bg-coral" style={{ width: `${Math.max(0, fin.committed - fin.paid) / Math.max(fin.budget, 1) * 100}%` }} />
          </div>
          <p className="mt-1.5 text-xs">{formatNaira(fin.paid)} paid · {formatNairaCompact(fin.committed)} committed</p>
        </motion.div>
      }

      <div className="absolute right-2 top-0 grid h-20 w-20 rotate-12 place-items-center rounded-full border-2 border-ink bg-bloom text-center font-display text-[11px] font-bold leading-tight text-ink shadow-pop-sm sm:right-6" aria-hidden="true">
        every
        <br />
        naira
        <br />
        tracked
      </div>
      <p className="sr-only">Sample data from the demo wedding workspace.</p>
    </div>);

}