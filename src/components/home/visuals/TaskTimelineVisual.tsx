import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { useDb } from '../../../contexts/DataContext';
import { dueLabel, isPast } from '../../../utils/dates';
import { cx } from '../../../utils/styles';

export function TaskTimelineVisual({ eventId = 'e_wedding' }: {eventId?: string;}) {
  const db = useDb();
  const event = db.events.find((e) => e.id === eventId);
  const tasks = db.tasks.
  filter((t) => t.eventId === eventId).
  sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0) || (a.dueDate ?? '').localeCompare(b.dueDate ?? '')).
  slice(0, 5);
  const done = db.tasks.filter((t) => t.eventId === eventId && t.status === 'done').length;
  const total = db.tasks.filter((t) => t.eventId === eventId).length;

  return (
    <div className="rounded-[1.6rem] border-2 border-ink bg-white p-5 shadow-pop-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-smoke">Plan</p>
          <p className="truncate font-display text-lg font-semibold text-ink">{event?.title ?? 'Event plan'}</p>
        </div>
        <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">{done}/{total} done</span>
      </div>
      <ul className="mt-4 divide-y divide-line">
        {tasks.map((t) => {
          const owner = db.collaborators.find((c) => c.id === t.assigneeId);
          const overdue = t.status !== 'done' && t.dueDate && isPast(t.dueDate);
          return (
            <li key={t.id} className="flex items-center gap-3 py-3">
              {t.status === 'done' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-forest" aria-label="Done" /> : <Circle className="h-5 w-5 shrink-0 text-line" aria-label="Open" />}
              <span className={cx('min-w-0 flex-1 truncate text-sm font-medium', t.status === 'done' ? 'text-smoke line-through' : 'text-ink')}>{t.title}</span>
              {owner &&
              <span className="hidden h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-[10px] font-bold text-paper sm:grid" title={owner.name}>
                  {owner.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
              }
              {t.dueDate && t.status !== 'done' &&
              <span className={cx('flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', overdue ? 'bg-coral text-ink' : 'bg-sand text-ink')}>
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {overdue ? 'Overdue' : dueLabel(t.dueDate)}
                </span>
              }
            </li>);

        })}
      </ul>
    </div>);

}