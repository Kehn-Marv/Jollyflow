import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useDb } from '../../../contexts/DataContext';
import { dueLabel, isPast } from '../../../utils/dates';
import { ProductFrame } from '../ProductFrame';
import { cx } from '../../../utils/styles';

const DAY = 86_400_000;

/** A calendar-style week strip over the live task list of the demo wedding. */
export function PlanHeroVisual({ eventId = 'e_wedding' }: {eventId?: string;}) {
  const db = useDb();
  const reduce = useReducedMotion();
  const event = db.events.find((e) => e.id === eventId);
  const tasks = db.tasks.filter((t) => t.eventId === eventId);
  const open = tasks.
  filter((t) => t.status !== 'done').
  sort((a, b) => (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9')).
  slice(0, 4);
  const done = tasks.length - tasks.filter((t) => t.status !== 'done').length;
  const people = db.collaborators.filter((c) => c.eventId === eventId);
  const initials = (id: string | null) => people.find((p) => p.id === id)?.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const week = Array.from({ length: 7 }, (_, i) => new Date(today.getTime() + i * DAY));
  const dueOn = (d: Date) => tasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate).toDateString() === d.toDateString());
  const overdueCount = tasks.filter((t) => t.status !== 'done' && t.dueDate && isPast(t.dueDate)).length;

  if (!event) return null;

  return (
    <ProductFrame>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-smoke">Plan</p>
            <p className="mt-0.5 truncate font-display text-lg font-semibold">{event.title}</p>
          </div>
          <p className="shrink-0 text-right text-xs text-smoke">
            <span className="block font-display text-lg font-semibold tabular-nums text-ink">
              {done}<span className="text-smoke">/{tasks.length}</span>
            </span>
            done
          </p>
        </div>

        {/* Week strip */}
        <ol className="mt-5 grid grid-cols-7 gap-1.5" aria-label="This week">
          {week.map((d, i) => {
            const due = dueOn(d);
            const isToday = i === 0;
            return (
              <li key={d.toISOString()} className={cx('flex flex-col items-center rounded-xl py-2', isToday ? 'bg-ink text-white' : 'bg-white')}>
                <span className={cx('text-[10px] font-medium uppercase', isToday ? 'text-white/60' : 'text-smoke')}>{d.toLocaleDateString('en-NG', { weekday: 'narrow' })}</span>
                <span className="mt-0.5 text-sm font-semibold tabular-nums">{d.getDate()}</span>
                <span className={cx('mt-1 h-1 w-1 rounded-full', due.length ? isToday ? 'bg-lime' : 'bg-ink' : 'bg-transparent')} aria-hidden="true" />
              </li>);

          })}
        </ol>

        {/* Upcoming tasks */}
        <ul className="mt-5 divide-y divide-line rounded-2xl bg-white px-4">
          {open.map((t, i) => {
            const overdue = t.dueDate ? isPast(t.dueDate) : false;
            return (
              <motion.li
                key={t.id}
                initial={reduce ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
                className="flex items-center gap-3 py-3">
                
                <span className="h-4 w-4 shrink-0 rounded-full border-[1.5px] border-ink/25" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm">{t.title}</span>
                {initials(t.assigneeId) &&
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sand text-[10px] font-semibold" aria-hidden="true">
                    {initials(t.assigneeId)}
                  </span>
                }
                {t.dueDate && <span className={cx('w-16 shrink-0 text-right text-xs tabular-nums', overdue ? 'font-medium text-coral' : 'text-smoke')}>{overdue ? 'Overdue' : dueLabel(t.dueDate)}</span>}
              </motion.li>);

          })}
        </ul>

        <div className="mt-4 flex items-center justify-between text-xs text-smoke">
          <span>{people.length} people on this plan</span>
          {overdueCount > 0 && <span className="text-coral">{overdueCount} overdue</span>}
        </div>
      </div>
      <p className="sr-only">Live sample data from the demo wedding plan.</p>
    </ProductFrame>);

}