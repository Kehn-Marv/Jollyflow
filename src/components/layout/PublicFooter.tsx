import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo';

const COLUMNS = [
{ title: 'Product', links: [['Planning', '/features/planning'], ['Gifting', '/features/gifting'], ['Vendors', '/features/vendors'], ['Explore events', '/explore'], ['Vendor directory', '/vendors']] },
{ title: 'Use cases', links: [['Weddings', '/use-cases/weddings'], ['Parties & birthdays', '/use-cases/parties'], ['Live events', '/use-cases/live-events']] },
{ title: 'Company', links: [['About', '/about'], ['Manifesto', '/manifesto'], ['Sign in', '/signin'], ['Create account', '/signup']] },
{ title: 'Legal', links: [['Privacy (prototype)', '/privacy'], ['Terms (prototype)', '/terms']] }];


export function PublicFooter() {
  return (
    <footer className="on-dark bg-ink text-paper">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-xs font-display text-2xl font-semibold leading-tight">Every event. One clear plan.</p>
            <p className="mt-4 max-w-sm text-sm text-paper/60">
              JolliFlow is a hackathon prototype. All payments are simulated, no money moves, and no bank partnership or endorsement is implied.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) =>
            <div key={col.title}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-paper/50">{col.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, to]) =>
                <li key={to}>
                      <Link to={to} className="text-sm text-paper/80 transition hover:text-lime">
                        {label}
                      </Link>
                    </li>
                )}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="mt-14 overflow-hidden" aria-hidden="true">
          <p className="select-none whitespace-nowrap font-display text-[19vw] font-bold leading-[0.8] tracking-tighter text-white/[0.06] lg:text-[13rem]">jolliflow</p>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-paper/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} JolliFlow. Built for Hackaholics 7.0.</p>
          <p>Made in Nigeria · Amounts shown in NGN</p>
        </div>
      </div>
    </footer>);

}