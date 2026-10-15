import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { cx } from '../../utils/styles';

export type StoryTone = 'paper' | 'ink' | 'sky' | 'lime' | 'pink' | 'forest' | 'white';

const TONE: Record<StoryTone, {bg: string;text: string;sub: string;eyebrow: string;check: string;}> = {
  paper: { bg: 'bg-paper', text: 'text-ink', sub: 'text-smoke', eyebrow: 'text-coral', check: 'bg-lime text-ink' },
  white: { bg: 'bg-white', text: 'text-ink', sub: 'text-smoke', eyebrow: 'text-coral', check: 'bg-lime text-ink' },
  ink: { bg: 'bg-ink on-dark', text: 'text-paper', sub: 'text-paper/70', eyebrow: 'text-lime', check: 'bg-lime text-ink' },
  sky: { bg: 'bg-sky', text: 'text-ink', sub: 'text-ink/75', eyebrow: 'text-ink/70', check: 'bg-white text-ink' },
  lime: { bg: 'bg-lime', text: 'text-ink', sub: 'text-ink/75', eyebrow: 'text-ink/70', check: 'bg-white text-ink' },
  pink: { bg: 'bg-bloom', text: 'text-ink', sub: 'text-ink/75', eyebrow: 'text-ink/70', check: 'bg-white text-ink' },
  forest: { bg: 'bg-forest on-dark', text: 'text-paper', sub: 'text-paper/75', eyebrow: 'text-lime', check: 'bg-lime text-ink' }
};

interface FeatureStoryProps {
  id?: string;
  tone: StoryTone;
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  points: string[];
  visual: React.ReactNode;
  reverse?: boolean;
  cta?: {to: string;label: string;};
}

export function FeatureStory({ id, tone, eyebrow, title, body, points, visual, reverse, cta }: FeatureStoryProps) {
  const t = TONE[tone];
  const headingId = `${id ?? eyebrow.replace(/\W+/g, '-').toLowerCase()}-title`;
  return (
    <section id={id} className={cx('scroll-mt-16 border-t-2 border-ink', t.bg)} aria-labelledby={headingId}>
      <div className="container grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className={cx(reverse && 'lg:order-2')}>
          <p className={cx('text-xs font-bold uppercase tracking-[0.2em]', t.eyebrow)}>{eyebrow}</p>
          <h2 id={headingId} className={cx('mt-3 text-4xl font-bold leading-[1.02] sm:text-5xl', t.text)}>
            {title}
          </h2>
          <p className={cx('mt-5 max-w-lg text-lg leading-relaxed', t.sub)}>{body}</p>
          <ul className="mt-6 space-y-2.5">
            {points.map((p) =>
            <li key={p} className={cx('flex items-start gap-2.5 text-[15px]', t.text)}>
                <span className={cx('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-ink', t.check)}>
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                {p}
              </li>
            )}
          </ul>
          {cta &&
          <Link to={cta.to} className={cx('mt-8 inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline', t.text)}>
              {cta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        </div>
        <div className={cx('min-w-0', reverse && 'lg:order-1')}>{visual}</div>
      </div>
    </section>);

}