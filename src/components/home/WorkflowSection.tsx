import React from 'react';
import { Banknote, CalendarHeart, CheckSquare, Gift, Image as ImageIcon, Store, Users } from 'lucide-react';
import { workflowSteps } from '../../data/marketing';
import { cx } from '../../utils/styles';

const HUB = [
{ label: 'Guests', icon: Users, pos: 'left-[4%] top-[8%]', color: 'bg-sky' },
{ label: 'Tasks', icon: CheckSquare, pos: 'right-[4%] top-[8%]', color: 'bg-lime' },
{ label: 'Vendors', icon: Store, pos: 'left-0 top-[44%]', color: 'bg-white' },
{ label: 'Money', icon: Banknote, pos: 'right-0 top-[44%]', color: 'bg-coral' },
{ label: 'Gifts', icon: Gift, pos: 'left-[8%] bottom-[6%]', color: 'bg-white' },
{ label: 'Memories', icon: ImageIcon, pos: 'right-[8%] bottom-[6%]', color: 'bg-sky' }];


export function WorkflowSection() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-bloom" aria-labelledby="how-title">
      <div className="container py-20 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/70">How it works</p>
          <h2 id="how-title" className="mt-3 text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Everything connects
            <br />
            to the event.
          </h2>
          <p className="mt-4 text-lg text-ink/75">Every RSVP, vendor payment, and ticket sale syncs in real time - so you always know where your event stands.</p>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative mx-auto aspect-square w-full max-w-[420px]" role="img" aria-label="Diagram: guests, tasks, vendors, money, gifts and memories all connect to one event">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {[[18, 14], [82, 14], [10, 50], [90, 50], [20, 88], [80, 88]].map(([x, y], i) =>
              <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="#10110F" strokeWidth="0.6" strokeDasharray="2 2" />
              )}
            </svg>
            <div className="absolute left-1/2 top-1/2 flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-3xl border-2 border-ink bg-ink p-3 text-center text-paper shadow-pop-lg sm:w-40 sm:p-4">
              <CalendarHeart className="h-7 w-7 text-lime" aria-hidden="true" />
              <span className="mt-2 font-display text-base font-semibold leading-tight sm:text-lg">Your event</span>
              <span className="text-[11px] text-paper/60 sm:text-xs">one source of truth</span>
            </div>
            {HUB.map(({ label, icon: Icon, pos, color }) =>
            <span key={label} className={cx('absolute flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-1.5 text-xs font-semibold text-ink shadow-pop-sm sm:gap-2 sm:px-3 sm:py-2 sm:text-sm', pos, color)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </span>
            )}
          </div>

          <ol className="space-y-3">
            {workflowSteps.map((s) =>
            <li key={s.n} className="flex items-start gap-4 rounded-[1.4rem] border-2 border-ink bg-white p-4 shadow-pop">
                <span className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-sm font-bold text-ink', s.color)}>{s.n}</span>
                <span>
                  <span className="block font-display text-lg font-semibold text-ink">{s.title}</span>
                  <span className="mt-0.5 block text-sm text-smoke">{s.body}</span>
                </span>
              </li>
            )}
          </ol>
        </div>
      </div>
    </section>);

}