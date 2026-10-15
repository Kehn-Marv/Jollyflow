import React from 'react';
import { Pencil } from 'lucide-react';
import type { WizardDraft } from '../../types/wizard';
import { EVENT_TYPE_LABELS, ROLE_LABELS } from '../../utils/events';
import { computeTimes } from '../../utils/wizard';
import { fmtDate, fmtTime } from '../../utils/dates';
import { formatNaira, parseNairaInput } from '../../utils/money';
import { cx } from '../../utils/styles';

interface StepReviewProps {
  draft: WizardDraft;
  update: (patch: Partial<WizardDraft>) => void;
  onEdit: (step: number) => void;
}

function Block({ title, step, onEdit, children }: {title: string;step: number;onEdit: (s: number) => void;children: React.ReactNode;}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display font-semibold text-ink">{title}</h3>
        <button type="button" onClick={() => onEdit(step)} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-ink hover:bg-sand" aria-label={`Edit ${title}`}>
          <Pencil className="h-3 w-3" aria-hidden="true" /> Edit
        </button>
      </div>
      <div className="mt-2 text-sm text-smoke">{children}</div>
    </section>);

}

export function StepReview({ draft, update, onEdit }: StepReviewProps) {
  const times = draft.date ? computeTimes(draft) : null;
  const on = Object.entries(draft.features).filter(([, v]) => v).map(([k]) => k);
  return (
    <div>
      <h2 className="text-2xl font-bold text-ink sm:text-3xl">Review & create</h2>
      <p className="mt-1 text-smoke">Check the details. Nothing is shared until you publish.</p>
      <div className="mt-6 overflow-hidden rounded-2xl border-2 border-ink bg-white">
        <img src={draft.coverUrl} alt="" className="aspect-[3/1] w-full object-cover" />
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-coral">{draft.type ? EVENT_TYPE_LABELS[draft.type] : ''}</p>
          <p className="font-display text-xl font-semibold text-ink">{draft.title}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Block title="Details" step={1} onEdit={onEdit}>
          {times && <p>{fmtDate(times.startsAt)}, {fmtTime(times.startsAt)} – {fmtTime(times.endsAt)}{times.overnight ? ' (next day)' : ''}</p>}
          <p>{draft.venue}, {draft.city}</p>
        </Block>
        <Block title="Guests & access" step={2} onEdit={onEdit}>
          <p>{draft.visibility === 'public' ? 'Public — listed on Explore' : 'Private — invitation link only'}</p>
          <p>RSVPs {draft.rsvpEnabled ? 'on' : 'off'} · plus-ones {draft.plusOnesAllowed ? 'allowed' : 'off'}{draft.capacity ? ` · capacity ${draft.capacity}` : ''}</p>
        </Block>
        <Block title="Budget" step={3} onEdit={onEdit}>
          <p className="font-semibold text-ink">{formatNaira(parseNairaInput(draft.budget) ?? 0)}</p>
          <p>{draft.categories.filter((c) => c.enabled).map((c) => c.name).join(', ') || 'No categories'}</p>
        </Block>
        <Block title="People" step={4} onEdit={onEdit}>
          {draft.collaborators.length ? draft.collaborators.map((c) => <p key={c.id}>{c.name} · {ROLE_LABELS[c.role]}</p>) : <p>Just you for now</p>}
        </Block>
        <Block title="Features" step={5} onEdit={onEdit}>
          <p className="capitalize">{['money', ...on].join(' · ')}</p>
          {draft.features.tickets && <p>{draft.tier.name}: {formatNaira(parseNairaInput(draft.tier.price) ?? 0)} × {draft.tier.quantity}</p>}
        </Block>
      </div>
      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-ink">When created</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2" role="radiogroup">
          {[
          { v: true, t: 'Publish now', b: 'The event page and RSVP link go live.' },
          { v: false, t: 'Save as draft', b: 'Only your team can see it until you publish.' }].
          map((o) =>
          <button key={o.t} type="button" role="radio" aria-checked={draft.publish === o.v} onClick={() => update({ publish: o.v })} className={cx('rounded-2xl border-2 p-4 text-left transition', draft.publish === o.v ? 'border-ink bg-lime/50' : 'border-line bg-white hover:border-ink')}>
              <span className="block font-semibold text-ink">{o.t}</span>
              <span className="text-sm text-smoke">{o.b}</span>
            </button>
          )}
        </div>
      </fieldset>
    </div>);

}