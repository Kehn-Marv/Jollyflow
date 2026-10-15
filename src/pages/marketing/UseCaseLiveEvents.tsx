import React from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, ShieldCheck, Users } from 'lucide-react';
import { PageHero } from '../../components/marketing/PageHero';
import { ModuleChecklist } from '../../components/marketing/ModuleChecklist';
import { useDb } from '../../contexts/DataContext';
import { tierStats, eventTicketStats } from '../../utils/tickets';
import { formatNaira, formatNairaCompact } from '../../utils/money';
import { images } from '../../data/images';
import { StatusPill } from '../../components/ui/StatusPill';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { btn, cx } from '../../utils/styles';

export function UseCaseLiveEvents() {
  const db = useDb();
  const tiers = db.ticketTiers.filter((t) => t.eventId === 'e_concert');
  const stats = eventTicketStats(db, 'e_concert');

  return (
    <>
      <PageHero
        tone="ink"
        eyebrow="Use case · Live events"
        title={<>Sell it out. Scan them in.</>}
        body="Ticket tiers, simulated checkout and a fast gate check-in that blocks duplicate entries — all tied to the same event budget."
        actions={<><Link to="/events/lagos-sound-nights-4" className={cx(btn.base, btn.lime, btn.lg)}>See a sample ticket page</Link><Link to="/app/events/new?type=concert" className={cx(btn.base, btn.onDark, btn.lg)}>Plan a live event</Link></>}
        visual={<img src={images.concert} alt="Crowd at an open-air concert in Lagos" className="aspect-[4/3] w-full rounded-[1.6rem] border-2 border-paper/20 object-cover" />} />
      
      <section className="bg-sky">
        <div className="container grid items-start gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.6rem] border-2 border-ink bg-white p-5 shadow-pop-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">Lagos Sound Nights Vol. 4 · tiers</h2>
              <StatusPill tone="dark">Sample</StatusPill>
            </div>
            <ul className="mt-4 space-y-3">
              {tiers.map((t) => {
                const s = tierStats(db, t.id);
                return (
                  <li key={t.id} className="rounded-2xl border border-line p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-ink">{t.name}</p>
                      <p className="font-semibold tabular-nums text-ink">{formatNaira(t.price)}</p>
                    </div>
                    <ProgressBar value={s.sold} max={t.quantity} label={`${t.name} sold`} tone={s.soldOut ? 'coral' : 'ink'} className="mt-3" size="sm" />
                    <p className="mt-2 text-xs text-smoke">{s.soldOut ? 'Sold out' : `${s.sold} sold · ${s.remaining} left`}</p>
                  </li>);

              })}
            </ul>
            <p className="mt-4 text-sm text-smoke">{stats.sold} tickets · {formatNairaCompact(stats.revenue)} in simulated sales</p>
          </div>
          <div className="space-y-4">
            {[
            { icon: ScanLine, t: 'Gate check-in', b: 'Enter or scan a ticket code. Valid, already used, cancelled and invalid tickets each get a clear result.' },
            { icon: ShieldCheck, t: 'No double entry', b: 'A ticket can only be checked in once. A second scan shows when it was first used.' },
            { icon: Users, t: 'Live counts', b: 'See how many guests are in versus tickets sold, per tier.' }].
            map(({ icon: Icon, t, b }) =>
            <div key={t} className="flex gap-4 rounded-[1.4rem] border-2 border-ink bg-white p-5 shadow-pop">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-lime"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span><span className="block font-semibold text-ink">{t}</span><span className="text-sm text-smoke">{b}</span></span>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="border-t-2 border-ink bg-white">
        <div className="container max-w-3xl py-20">
          <ModuleChecklist
            title="A live-event workspace turns on"
            note="Guest lists and gifting stay off — tickets are the guest list."
            features={{ guests: false, vendors: true, tickets: true, gifting: false, memories: true }} />
          
        </div>
      </section>
    </>);

}