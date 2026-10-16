import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FeatureHeroProps {
  kicker: string;
  title: React.ReactNode;
  body: string;
  actions?: React.ReactNode;
  visual: React.ReactNode;
}

/** Editorial, type-led hero for feature pages: one statement, one live product surface. */
export function FeatureHero({ kicker, title, body, actions, visual }: FeatureHeroProps) {
  const reduce = useReducedMotion();
  const rise = (delay = 0) =>
  reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <section className="on-dark relative overflow-hidden bg-ink text-paper">
      <div className="container relative grid items-center gap-14 py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:py-28">
        <div>
          <motion.p {...rise(0)} className="flex items-center gap-2 text-sm font-medium text-paper/55">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
            {kicker}
          </motion.p>
          <motion.h1 {...rise(0.05)} className="mt-6 max-w-xl text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.035em] sm:text-6xl xl:text-[4.25rem]">
            {title}
          </motion.h1>
          <motion.p {...rise(0.12)} className="mt-6 max-w-md text-lg leading-relaxed text-paper/60">
            {body}
          </motion.p>
          {actions &&
          <motion.div {...rise(0.18)} className="mt-10 flex flex-col gap-3 sm:flex-row">
              {actions}
            </motion.div>
          }
        </div>
        <motion.div {...rise(0.15)} className="min-w-0">
          {visual}
        </motion.div>
      </div>
    </section>);

}