import React from 'react';
import { cx } from '../../utils/styles';

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  tone?: 'ink' | 'paper' | 'lime' | 'sky' | 'pink' | 'coral' | 'forest';
  actions?: React.ReactNode;
  visual?: React.ReactNode;
}

const TONES = {
  ink: 'bg-ink text-paper on-dark',
  forest: 'bg-forest text-paper on-dark',
  paper: 'bg-paper text-ink',
  lime: 'bg-lime text-ink',
  sky: 'bg-sky text-ink',
  pink: 'bg-bloom text-ink',
  coral: 'bg-coral text-ink'
};

export function PageHero({ eyebrow, title, body, tone = 'ink', actions, visual }: PageHeroProps) {
  const dark = tone === 'ink' || tone === 'forest';
  return (
    <section className={cx('relative overflow-hidden border-b-2 border-ink', TONES[tone])}>
      <div className={cx('pointer-events-none absolute inset-0 opacity-60', dark ? 'bg-dots-light' : 'bg-dots')} aria-hidden="true" />
      <div className={cx('container relative grid items-center gap-10 py-16 lg:py-24', visual && 'lg:grid-cols-[1.05fr_1fr]')}>
        <div>
          <p className={cx('text-xs font-bold uppercase tracking-[0.2em]', dark ? 'text-lime' : 'text-ink/70')}>{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[0.98] sm:text-6xl">{title}</h1>
          <p className={cx('mt-5 max-w-xl text-lg leading-relaxed', dark ? 'text-paper/75' : 'text-ink/75')}>{body}</p>
          {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>}
        </div>
        {visual && <div className="min-w-0">{visual}</div>}
      </div>
    </section>);

}