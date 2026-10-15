import React from 'react';
import { Baby, Briefcase, Cake, Crown, GraduationCap, Heart, Music, PartyPopper, PenLine, Sparkles, Users } from 'lucide-react';
import type { EventType } from '../../types/domain';
import type { StepProps } from '../../types/wizard';
import { EVENT_TYPE_LABELS } from '../../utils/events';
import { coverFor, defaultFeaturesFor, starterCategoriesFor, SAMPLE_BUDGETS } from '../../utils/wizard';
import { parseNairaInput } from '../../utils/money';
import { cx } from '../../utils/styles';

const OPTIONS: Array<{type: EventType;icon: typeof Cake;color: string;}> = [
{ type: 'birthday', icon: Cake, color: 'bg-bloom' },
{ type: 'wedding', icon: Heart, color: 'bg-coral' },
{ type: 'traditional_wedding', icon: Crown, color: 'bg-lime' },
{ type: 'anniversary', icon: Sparkles, color: 'bg-sky' },
{ type: 'party', icon: PartyPopper, color: 'bg-bloom' },
{ type: 'naming', icon: Baby, color: 'bg-sky' },
{ type: 'graduation', icon: GraduationCap, color: 'bg-lime' },
{ type: 'corporate', icon: Briefcase, color: 'bg-white' },
{ type: 'concert', icon: Music, color: 'bg-coral' },
{ type: 'community', icon: Users, color: 'bg-white' },
{ type: 'custom', icon: PenLine, color: 'bg-sand' }];


export function StepOccasion({ draft, update, errors }: StepProps) {
  function choose(type: EventType) {
    const budgetKobo = parseNairaInput(draft.budget) ?? 0;
    update({
      type,
      features: defaultFeaturesFor(type),
      coverUrl: draft.type ? draft.coverUrl : coverFor(type),
      visibility: type === 'concert' || type === 'community' || type === 'corporate' ? 'public' : 'private',
      categories: draft.categories.length > 0 && draft.type === type ? draft.categories : starterCategoriesFor(type, budgetKobo || SAMPLE_BUDGETS[type] || 0),
      budget: draft.budget || (SAMPLE_BUDGETS[type] ? String((SAMPLE_BUDGETS[type] as number) / 100) : '')
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink sm:text-3xl">What are you celebrating?</h2>
      <p className="mt-1 text-smoke">We’ll suggest the right tools — you can change anything later.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="radiogroup" aria-label="Occasion" aria-describedby={errors.type ? 'type-error' : undefined}>
        {OPTIONS.map(({ type, icon: Icon, color }) => {
          const on = draft.type === type;
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => choose(type)}
              className={cx('flex flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left transition', on ? 'border-ink bg-white shadow-pop' : 'border-line bg-white/70 hover:border-ink')}>
              
              <span className={cx('grid h-10 w-10 place-items-center rounded-full border-2 border-ink', color)}><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span className="font-semibold text-ink">{EVENT_TYPE_LABELS[type]}</span>
            </button>);

        })}
      </div>
      {errors.type && <p id="type-error" role="alert" className="mt-3 text-sm font-medium text-danger">{errors.type}</p>}
    </div>);

}