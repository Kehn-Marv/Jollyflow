import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useCases } from '../../data/marketing';
import { cx } from '../../utils/styles';

export function UseCasesSection() {
  return (
    <section id="use-cases" className="on-dark scroll-mt-16 border-t-2 border-ink bg-ink text-paper" aria-labelledby="uses-title">
      <div className="container py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">Use cases</p>
          <h2 id="uses-title" className="mt-3 text-4xl font-bold leading-[1.02] sm:text-5xl">For everybody who celebrates.</h2>
          <p className="mt-4 text-lg text-paper/70">Same foundations, shaped to the occasion. Turn on only what each event needs.</p>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((u) =>
          <li key={u.to}>
              <Link to={u.to} className="group block overflow-hidden rounded-[1.4rem] border-2 border-paper/15 transition hover:border-lime">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={u.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                </div>
                <div className={cx('flex items-end justify-between gap-3 border-t-2 border-ink p-4 text-ink', u.block)}>
                  <span>
                    <span className="block font-display text-xl font-semibold">{u.label}</span>
                    <span className="block text-sm text-ink/75">{u.sub}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </section>);

}