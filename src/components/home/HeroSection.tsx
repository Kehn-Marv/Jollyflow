import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, Loader2, PlayCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDemoEntry } from '../../hooks/useDemoEntry';
import { HeroComposition } from './HeroComposition';
import { btn, cx } from '../../utils/styles';
export function HeroSection() {
  const {
    user
  } = useAuth();
  const {
    enter,
    pending
  } = useDemoEntry();
  const reduce = useReducedMotion();
  return <section className="on-dark relative overflow-hidden bg-ink text-paper" aria-labelledby="hero-title">
      <div className="bg-dots-light pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="container relative grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.02fr_1fr] lg:gap-8 lg:pb-24 lg:pt-16">
        <motion.div initial={reduce ? false : {
        opacity: 0,
        y: 16
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          
          <h1 id="hero-title" className="mt-6 text-[2.75rem] font-bold leading-[0.95] sm:text-6xl xl:text-[5.25rem]">
            Make the celebration <span className="text-lime">happen.</span>
            <br />
            
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/75">
            Plan your event, coordinate your people, keep every naira accountable. Everything important, connected in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={user ? '/app/events/new' : '/signup'} className={cx(btn.base, btn.lime, btn.lg)}>
              Create an event <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button type="button" onClick={() => enter()} disabled={pending} className={cx(btn.base, btn.onDark, btn.lg)}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <PlayCircle className="h-4 w-4" aria-hidden="true" />}
              Explore a live demo
            </button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-paper/60">
            {['No sign-up needed for the demo', 'Payments are simulated', 'Built for ₦ and Nigerian events'].map((t) => <li key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-lime" aria-hidden="true" />
                {t}
              </li>)}
          </ul>
        </motion.div>
        <HeroComposition />
      </div>
    </section>;
}