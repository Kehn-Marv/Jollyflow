import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDemoEntry } from '../../hooks/useDemoEntry';
import { btn, cx } from '../../utils/styles';

export function ClosingCta() {
  const { user } = useAuth();
  const { enter, pending } = useDemoEntry();
  return (
    <section className="relative overflow-hidden border-t-2 border-ink bg-coral" aria-labelledby="cta-title">
      <div className="absolute -left-10 top-10 h-32 w-32 rounded-full border-2 border-ink bg-lime" aria-hidden="true" />
      <div className="absolute -right-8 bottom-8 h-40 w-40 rounded-[2rem] border-2 border-ink bg-bloom rotate-12" aria-hidden="true" />
      <div className="container relative py-24 text-center lg:py-32">
        <h2 id="cta-title" className="mx-auto max-w-3xl text-5xl font-bold leading-[0.95] text-ink sm:text-7xl" style={{ paddingRight: "0px" }}>Ready when the 
party is.</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink/80">Set up your first event in a few minutes, or walk through a fully loaded planner workspace right now.</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={user ? '/app/events/new' : '/signup'} className={cx(btn.base, btn.ink, btn.lg)}>
            Create an event <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button type="button" onClick={() => enter()} disabled={pending} className={cx(btn.base, btn.outline, btn.lg)}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Explore a live demo
          </button>
        </div>
      </div>
    </section>);

}