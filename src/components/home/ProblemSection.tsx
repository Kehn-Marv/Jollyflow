import React from 'react';
import { FileSpreadsheet, MessageCircle, Receipt, StickyNote } from 'lucide-react';
import { problemFragments } from '../../data/marketing';
import { cx } from '../../utils/styles';
const ICON = {
  chat: MessageCircle,
  receipt: Receipt,
  file: FileSpreadsheet,
  note: StickyNote
};
export function ProblemSection() {
  return <section className="relative overflow-hidden rounded-b-[2.5rem] bg-paper" aria-labelledby="problem-title">
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="container relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          
          <h2 id="problem-title" className="mt-4 text-3xl font-semibold leading-tight text-ink sm:text-[2.6rem]">
            Celebrations should feel magical — not scattered across fourteen group chats, three spreadsheets and a bank app.
          </h2>
          <p className="mt-6 max-w-lg text-lg text-smoke">
            Who paid the decorator? How many guests are actually coming? Which deposit is due tomorrow? When nobody can answer quickly, the event pays for it.
          </p>
          <p className="mt-6 font-display text-xl font-semibold text-ink">So we built one place for all of it.</p>
        </div>
        <ul className="relative mx-auto grid w-full max-w-md gap-4" aria-label="Examples of scattered planning">
          {problemFragments.map((f, i) => {
          const Icon = ICON[f.kind as keyof typeof ICON];
          return <li key={f.id} style={{
            transform: `rotate(${f.rotate})`
          }} className={cx('flex items-start gap-3 rounded-2xl border-2 border-ink p-4 shadow-pop', f.color, i % 2 ? 'ml-8 sm:ml-14' : 'mr-8 sm:mr-14')}>
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
                <span>
                  <span className="block font-semibold leading-snug text-ink">{f.text}</span>
                  <span className="mt-0.5 block text-xs text-ink/60">{f.meta}</span>
                </span>
              </li>;
        })}
        </ul>
      </div>
    </section>;
}