import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Insight } from '../../types/insights';
import { cx } from '../../utils/styles';

const DOT = {
  critical: 'bg-coral',
  warning: 'bg-[#E3A008]',
  info: 'bg-smoke/50'
};
const LABEL = { critical: 'Urgent', warning: 'Needs attention', info: 'Heads up' };

interface InsightCardProps {
  insight: Insight;
  tone?: 'light' | 'dark';
  showEvent?: boolean;
}

/** A calm, scannable reminder: event, one-line title, one short detail. The rule lives in a tooltip. */
export function InsightCard({ insight, tone = 'light', showEvent = true }: InsightCardProps) {
  const dark = tone === 'dark';
  return (
    <li>
      <Link
        to={insight.link}
        title={`Why you’re seeing this: ${insight.rule}`}
        className={cx(
          'group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors',
          dark ? 'bg-white/[0.04] hover:bg-white/[0.08]' : 'bg-paper/70 hover:bg-sand'
        )}>
        
        <span className={cx('h-2 w-2 shrink-0 rounded-full', DOT[insight.severity])} aria-hidden="true" />
        <span className="min-w-0 flex-1">
          {showEvent && <span className={cx('block truncate text-[11px]', dark ? 'text-paper/50' : 'text-smoke')}>{insight.eventTitle}</span>}
          <span className={cx('block truncate text-sm font-medium', dark ? 'text-paper' : 'text-ink')}>{insight.title}</span>
          <span className={cx('mt-0.5 block truncate text-xs', dark ? 'text-paper/60' : 'text-smoke')}>{insight.detail}</span>
          <span className="sr-only">{LABEL[insight.severity]}. Rule: {insight.rule}</span>
        </span>
        <ChevronRight className={cx('h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5', dark ? 'text-paper/40' : 'text-smoke/60')} aria-hidden="true" />
      </Link>
    </li>);

}