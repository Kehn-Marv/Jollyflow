import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/brand/Logo';
import { btn, cx } from '../utils/styles';

export function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-ink px-6 text-center text-paper on-dark">
      <Logo tone="light" />
      <p className="mt-10 font-display text-[7rem] font-bold leading-none text-lime">404</p>
      <h1 className="mt-4 text-3xl font-semibold">This page left the party early.</h1>
      <p className="mt-3 max-w-md text-paper/70">The link may be old or mistyped. Let’s get you back to somewhere useful.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className={cx(btn.base, btn.lime, btn.md)}>Go home</Link>
        <Link to="/explore" className={cx(btn.base, btn.onDark, btn.md)}>Explore events</Link>
        <Link to="/app" className={cx(btn.base, btn.onDark, btn.md)}>Open workspace</Link>
      </div>
    </main>);

}