import React, { useMemo, useState } from 'react';
import { BellOff } from 'lucide-react';
import type { Insight, InsightSeverity } from '../../types/insights';
import { InsightCard } from './InsightCard';
import { cx } from '../../utils/styles';

const GROUPS: Array<{id: InsightSeverity;label: string;short: string;}> = [
{ id: 'critical', label: 'Urgent', short: 'Urgent' },
{ id: 'warning', label: 'Needs attention', short: 'Attention' },
{ id: 'info', label: 'Heads up', short: 'Heads up' }];


export type NotificationFilter = 'all' | InsightSeverity;

function useCounts(insights: Insight[]) {
  return useMemo(
    () => Object.fromEntries(GROUPS.map((g) => [g.id, insights.filter((i) => i.severity === g.id).length])) as Record<InsightSeverity, number>,
    [insights]
  );
}

/** Segmented filter. Labels never wrap, so every tab keeps its count on the same line. */
export function NotificationFilters({ insights, value, onChange }: {insights: Insight[];value: NotificationFilter;onChange: (f: NotificationFilter) => void;}) {
  const counts = useCounts(insights);
  const tabs = [{ id: 'all' as NotificationFilter, label: 'All', n: insights.length }, ...GROUPS.map((g) => ({ id: g.id as NotificationFilter, label: g.short, n: counts[g.id] }))];
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-paper p-1" role="tablist" aria-label="Filter notifications">
      {tabs.map((t) =>
      <button
        key={t.id}
        type="button"
        role="tab"
        aria-selected={value === t.id}
        disabled={t.n === 0}
        onClick={() => onChange(t.id)}
        className={cx(
          'inline-flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
          value === t.id ? 'bg-white text-ink shadow-sm' : 'text-smoke hover:text-ink'
        )}>
        
          {t.label}
          <span className="tabular-nums opacity-60">{t.n}</span>
        </button>
      )}
    </div>);

}

export function NotificationsList({ insights, filter, onNavigate }: {insights: Insight[];filter: NotificationFilter;onNavigate: () => void;}) {
  const counts = useCounts(insights);
  const groups = GROUPS.filter((g) => (filter === 'all' || filter === g.id) && counts[g.id] > 0);

  if (!insights.length) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-sand"><BellOff className="h-5 w-5 text-smoke" aria-hidden="true" /></span>
        <p className="mt-4 font-medium text-ink">You’re all caught up</p>
        <p className="mt-1 text-sm text-smoke">New reminders will appear here.</p>
      </div>);

  }

  return (
    <div className="px-4 pb-6 pt-4">
      <div className="space-y-6" onClick={onNavigate}>
        {groups.map((g) =>
        <section key={g.id} aria-labelledby={`n-${g.id}`}>
            <h3 id={`n-${g.id}`} className="mb-2 px-2 text-xs font-medium text-smoke">
              {g.label} <span className="tabular-nums">· {counts[g.id]}</span>
            </h3>
            <ul className="space-y-1.5">
              {insights.filter((i) => i.severity === g.id).map((i) => <InsightCard key={i.id} insight={i} />)}
            </ul>
          </section>
        )}
      </div>
      <p className="mt-6 px-2 text-[11px] leading-relaxed text-smoke/80">Reminders come from simple rules, not AI. Hover one to see why it appeared.</p>
    </div>);

}

/** Convenience wrapper holding filter state. */
export function useNotificationFilter() {
  return useState<NotificationFilter>('all');
}