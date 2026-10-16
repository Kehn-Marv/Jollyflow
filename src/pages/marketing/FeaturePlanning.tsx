import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { FeatureHero } from '../../components/marketing/FeatureHero';
import { PlanHeroVisual } from '../../components/marketing/visuals/PlanHeroVisual';
import { InsightCard } from '../../components/insights/InsightCard';
import { useDb } from '../../contexts/DataContext';
import { computeInsights } from '../../utils/insights';
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '../../utils/events';
import type { CollaboratorRole } from '../../types/domain';
import { btn, cx } from '../../utils/styles';

const PHASES = [
{ when: '12 weeks out', what: 'Venue, budget, core vendors', color: 'bg-lime' },
{ when: '8 weeks out', what: 'Invitations, aso-ebi, deposits', color: 'bg-sky' },
{ when: '4 weeks out', what: 'RSVP follow-ups, programme', color: 'bg-bloom' },
{ when: '1 week out', what: 'Final headcount, balances due', color: 'bg-coral' },
{ when: 'Event day', what: 'Check-in, run of show', color: 'bg-white' }];


export function FeaturePlanning() {
  const db = useDb();
  const insights = computeInsights(db, new Date(), 'e_wedding').slice(0, 3);
  const roles = Object.keys(ROLE_LABELS) as CollaboratorRole[];

  return (
    <>
      <FeatureHero
        kicker="For planners"
        title={<>Everyone knows <span className="text-lime">what’s next.</span></>}
        body="One shared plan for co-hosts, family and crew — every task with an owner and a date, so nothing waits on a phone call."
        actions={<><Link to="/signup" className={cx(btn.base, btn.lime, btn.lg)}>Start a plan</Link><Link to="/signin" className={cx(btn.base, btn.onDark, btn.lg)}>Sign in</Link></>}
        visual={<PlanHeroVisual />} />
      

      <section className="bg-paper">
        <div className="container py-20">
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">A timeline that matches how events really happen</h2>
          <ol className="mt-10 grid gap-3 md:grid-cols-5">
            {PHASES.map((p, i) =>
            <li key={p.when} className={cx('relative rounded-[1.4rem] border-2 border-ink p-5 shadow-pop', p.color)}>
                <span className="font-display text-sm font-bold text-ink/60">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-6 font-display text-lg font-semibold text-ink">{p.when}</p>
                <p className="mt-1 text-sm text-ink/75">{p.what}</p>
              </li>
            )}
          </ol>
        </div>
      </section>

      <section className="border-t-2 border-ink bg-white">
        <div className="container grid gap-12 py-20 lg:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-coral"><Users className="h-4 w-4" aria-hidden="true" /> Roles</p>
            <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">The right access for every helper</h2>
            <p className="mt-4 text-smoke">Give your finance lead the budget without handing them the guest list. Roles are recorded per event.</p>
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {roles.map((r) =>
              <li key={r} className="rounded-2xl border border-line bg-paper p-4">
                  <p className="font-semibold text-ink">{ROLE_LABELS[r]}</p>
                  <p className="text-sm text-smoke">{ROLE_DESCRIPTIONS[r]}</p>
                </li>
              )}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">Operational visibility</p>
            <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Know what’s slipping, today</h2>
            <p className="mt-4 text-smoke">Live from the sample wedding workspace. Every alert explains its rule.</p>
            <ul className="mt-6 space-y-1 rounded-[1.4rem] border-2 border-ink bg-white p-2 shadow-pop">
              {insights.map((i) => <InsightCard key={i.id} insight={i} showEvent={false} />)}
            </ul>
          </div>
        </div>
      </section>
    </>);

}