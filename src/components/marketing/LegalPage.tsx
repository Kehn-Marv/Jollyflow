import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { LegalSection } from '../../data/legal';

interface LegalPageProps {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({ title, intro, sections }: LegalPageProps) {
  return (
    <div className="bg-paper">
      <div className="container max-w-3xl py-16 lg:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">Legal · prototype</p>
        <h1 className="mt-3 text-4xl font-bold text-ink sm:text-5xl">{title}</h1>
        <div role="note" className="mt-6 flex gap-3 rounded-2xl border-2 border-ink bg-lime p-4 text-ink">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium">Prototype policy content pending legal review. This is not legal advice and not a complete production policy.</p>
        </div>
        <p className="mt-8 text-lg text-smoke">{intro}</p>
        <div className="mt-10 space-y-10">
          {sections.map((s, i) =>
          <section key={s.heading} aria-labelledby={`legal-${i}`}>
              <h2 id={`legal-${i}`} className="text-xl font-semibold text-ink">
                {i + 1}. {s.heading}
              </h2>
              {s.body.map((p) =>
            <p key={p} className="mt-3 leading-relaxed text-smoke">{p}</p>
            )}
            </section>
          )}
        </div>
        <p className="mt-12 border-t border-line pt-6 text-sm text-smoke">Last updated for the Hackaholics 7.0 prototype build.</p>
      </div>
    </div>);

}