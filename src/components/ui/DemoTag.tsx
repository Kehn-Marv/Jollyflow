import React from 'react';
import { FlaskConical } from 'lucide-react';
import { cx } from '../../utils/styles';

interface DemoTagProps {
  children?: React.ReactNode;
  className?: string;
  tone?: 'light' | 'dark';
}

/** Marks sample content and simulated behaviour so nothing reads as real. */
export function DemoTag({ children = 'Sample data', className, tone = 'light' }: DemoTagProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        tone === 'light' ? 'border-ink/30 text-smoke' : 'border-paper/40 text-paper/80',
        className
      )}>
      
      <FlaskConical className="h-3 w-3" aria-hidden="true" />
      {children}
    </span>);

}