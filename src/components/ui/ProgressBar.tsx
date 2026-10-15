import React from 'react';
import { cx } from '../../utils/styles';

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  tone?: 'ink' | 'lime' | 'coral' | 'sky' | 'pink';
  className?: string;
  size?: 'sm' | 'md';
}

const FILL = { ink: 'bg-ink', lime: 'bg-lime', coral: 'bg-coral', sky: 'bg-sky', pink: 'bg-bloom' };

export function ProgressBar({ value, max, label, tone = 'ink', className, size = 'md' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, value / max * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cx('w-full overflow-hidden rounded-full bg-sand', size === 'sm' ? 'h-1.5' : 'h-2.5', className)}>
      
      <div className={cx('h-full rounded-full transition-[width] duration-500', FILL[tone])} style={{ width: `${pct}%` }} />
    </div>);

}