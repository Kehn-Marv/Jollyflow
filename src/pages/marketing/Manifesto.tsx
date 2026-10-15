import React from 'react';
import { Link } from 'react-router-dom';
import { btn, cx } from '../../utils/styles';

const LINES = [
{ lead: 'The host deserves to enjoy the party.', body: 'Not spend it answering “where do I park?” and “has the DJ been paid?”' },
{ lead: 'Every naira should have a name.', body: 'Who sent it, what it was for, and whether it actually arrived.' },
{ lead: 'Pending is not paid.', body: 'We will never let an estimate or an unconfirmed transfer look like money in hand.' },
{ lead: 'Warnings should come with directions.', body: 'An alert without a link to fix it is just anxiety.' },
{ lead: 'Simple events stay simple.', body: 'A birthday dinner doesn’t need ticket tiers. Turn on only what you need.' },
{ lead: 'Vendors are partners.', body: 'Clear requests, clear deposits, clear balances — fewer awkward calls.' },
{ lead: 'Memories belong with the moment.', body: 'Photos live with the event, not lost in someone’s camera roll.' }];


export function Manifesto() {
  return (
    <div className="on-dark bg-ink text-paper">
      <div className="container max-w-4xl py-20 lg:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">Manifesto</p>
        <h1 className="mt-4 text-5xl font-bold leading-[0.95] sm:text-7xl">
          Celebrate more.
          <br />
          <span className="text-coral">Chase less.</span>
        </h1>
        <ol className="mt-16 space-y-10">
          {LINES.map((l, i) =>
          <li key={l.lead} className="grid gap-3 border-t border-paper/15 pt-8 sm:grid-cols-[4rem_1fr]">
              <span className="font-display text-lg font-bold text-lime">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="text-2xl font-semibold sm:text-3xl">{l.lead}</h2>
                <p className="mt-2 text-lg text-paper/65">{l.body}</p>
              </div>
            </li>
          )}
        </ol>
        <div className="mt-16 flex flex-wrap gap-3">
          <Link to="/signup" className={cx(btn.base, btn.lime, btn.lg)}>Start planning</Link>
          <Link to="/about" className={cx(btn.base, btn.onDark, btn.lg)}>About us</Link>
        </div>
      </div>
    </div>);

}