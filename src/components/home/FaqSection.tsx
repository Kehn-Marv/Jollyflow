import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/Accordion';
import { faqs } from '../../data/marketing';

export function FaqSection() {
  return (
    <section className="border-t-2 border-ink bg-paper" aria-labelledby="faq-title">
      <div className="container grid gap-10 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">FAQ</p>
          <h2 id="faq-title" className="mt-3 text-4xl font-bold leading-[1.02] text-ink sm:text-5xl">Questions, answered honestly.</h2>
          <p className="mt-4 max-w-sm text-smoke">Straight answers about privacy, tickets, money and what this prototype does — and doesn’t — do yet.</p>
        </div>
        <Accordion type="single" defaultValue="faq-0" className="space-y-3">
          {faqs.map((f, i) =>
          <AccordionItem key={f.q} value={`faq-${i}`} className="rounded-2xl border-2 border-ink bg-white px-5 last:border-b-2">
              <AccordionTrigger className="py-4 text-left font-display text-base font-semibold text-ink hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="pb-4 text-[15px] leading-relaxed text-smoke">{f.a}</AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </section>);

}