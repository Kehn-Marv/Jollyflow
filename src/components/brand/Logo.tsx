import React from 'react';
import { cx } from '../../utils/styles';

interface LogoProps {
  tone?: 'dark' | 'light';
  className?: string;
  compact?: boolean;
}

/** JolliFlow wordmark: a lime "flow" mark with a coral spark. */
export function Logo({ tone = 'dark', className, compact = false }: LogoProps) {
  const text = tone === 'light' ? 'text-paper' : 'text-ink';
  return (
    <span className={cx('inline-flex items-center gap-2 font-display font-bold tracking-tight', text, className)}>
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="10" fill="#D9F52B" stroke="#10110F" strokeWidth="2" />
        <path d="M9 19.5c2.5 0 3.2-7 6-7s3 7 5.8 7c1.4 0 2.3-1 2.9-2.4" fill="none" stroke="#10110F" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="23.5" cy="9.5" r="2.6" fill="#FF704F" stroke="#10110F" strokeWidth="1.5" />
      </svg>
      {!compact && <span className="text-[1.3rem] leading-none">jolliflow</span>}
    </span>);

}