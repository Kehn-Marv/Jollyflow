import React from 'react';
import { Quote } from 'lucide-react';
import { testimonials } from '../../data/marketing';

export function TestimonialsSection() {
  return (
    <section className="border-t-2 border-ink bg-lime" aria-labelledby="voices-title">
      <div className="container py-20 lg:py-24">
        <h2 id="voices-title" className="text-4xl font-bold leading-[1.02] text-ink sm:text-5xl">What we’re building for.</h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((t) =>
          <li key={t.name} className="flex flex-col rounded-[1.4rem] border-2 border-ink bg-white p-5 shadow-pop">
              <Quote className="h-6 w-6 text-coral" aria-hidden="true" />
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink">“{t.quote}”</blockquote>
              <p className="mt-4 border-t border-line pt-3 text-xs font-semibold text-smoke">{t.name}</p>
            </li>
          )}
        </ul>
      </div>
    </section>);

}