import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, AlertTriangle, ArrowUpRight, Info } from 'lucide-react';
import type { Insight } from '../../types/insights';
import { cx } from '../../utils/styles';

const SEVERITY = {
  critical: { icon: AlertOctagon, label: 'Urgent', badge: 'bg-coral text-ink' },
  warning: { icon: AlertTriangle, label: 'Needs attention', badge: 'bg-bloom text-ink' },
  info: { icon: Info, label: 'Heads up', badge: 'bg-sky text-ink' }
};

interface InsightCardProps {
  insight: Insight;
  tone?: 'light' | 'dark';
  showEvent?: boolean;
}

export function InsightCard({ insight, tone = 'light', showEvent = true }: InsightCardProps) {
  const s = SEVERITY[insight.severity];
  const Icon = s.icon;
  const dark = tone === 'dark';
  return (
    <li>
      <Link
        to={insight.link}
        className={cx(
          'group flex gap-3 rounded-xl p-3 transition',
          dark ? 'hover:bg-white/[0.06]' : 'hover:bg-sand'
        )}>
        
        <span className={cx('mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink', s.badge)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className={cx('text-[11px] font-bold uppercase tracking-wider', dark ? 'text-lime' : 'text-coral')}>{s.label}</span>
            {showEvent && <span className={cx('truncate text-xs', dark ? 'text-paper/55' : 'text-smoke')}>{insight.eventTitle}</span>}
          </span>
          <span className={cx('mt-0.5 block font-semibold leading-snug', dark ? 'text-paper' : 'text-ink')}>{insight.title}</span>
          <span className={cx('mt-0.5 block text-sm leading-snug', dark ? 'text-paper/70' : 'text-smoke')}>{insight.detail}</span>
          <span className={cx('mt-1.5 block text-[11px]', dark ? 'text-paper/45' : 'text-smoke/80')}>Rule: {insight.rule}</span>
        </span>
        <ArrowUpRight className={cx('mt-1 h-4 w-4 shrink-0 opacity-50 transition group-hover:opacity-100', dark ? 'text-paper' : 'text-ink')} aria-hidden="true" />
      </Link>
    </li>);

}