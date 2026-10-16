import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { btn, cx } from '../../utils/styles';

const BELIEFS = [
{
  lead: 'The host should get to be a guest.',
  body: 'You planned it for months. On the day, you should be on the dance floor — not answering who paid the DJ.'
},
{
  lead: 'Money needs a name.',
  body: 'Who sent it, what it was for, whether it landed. If we can’t say that, we don’t show the number.'
},
{
  lead: 'Pending isn’t paid.',
  body: 'An estimate is a guess. An unconfirmed transfer is a promise. Neither will ever look like money in hand.'
},
{
  lead: 'An alert should point somewhere.',
  body: 'Every reminder tells you why it fired and opens the exact thing to fix. Otherwise it’s just noise.'
},
{
  lead: 'Small events stay small.',
  body: 'A birthday dinner doesn’t need ticket tiers. Switch on what this event needs and nothing else.'
},
{
  lead: 'Vendors are on your side.',
  body: 'Clear requests, honest deposit dates, one balance both of you agree on. Fewer awkward calls.'
}];


export function Manifesto() {
  const { user } = useAuth();
  return (
    <div className="on-dark min-h-[calc(100vh-4rem)] bg-ink text-paper">
      <div className="container max-w-3xl py-24 lg:py-32">
        <p className="text-sm font-medium text-paper/50">Manifesto</p>
        <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-7xl">
          Celebrate more.
          <br />
          <span className="text-lime">Chase less.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-paper/60">
          Nigerian celebrations are big, loud and full of love. Planning them shouldn’t mean a dozen WhatsApp groups, a notebook of transfers and a knot in your stomach. Here is what we hold ourselves to.
        </p>

        <ol className="mt-20 divide-y divide-white/10 border-y border-white/10">
          {BELIEFS.map((b, i) =>
          <li key={b.lead} className="grid gap-2 py-9 sm:grid-cols-[3.5rem_1fr] sm:gap-6">
              <span className="font-display text-sm tabular-nums text-paper/35">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{b.lead}</h2>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-paper/60 sm:text-lg">{b.body}</p>
              </div>
            </li>
          )}
        </ol>

        <div className="mt-20">
          <p className="max-w-md font-display text-2xl font-semibold leading-snug tracking-tight">
            Plan it properly. Then go and enjoy it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={user ? '/app/events/new' : '/signup'} className={cx(btn.base, btn.lime, btn.lg)}>Start planning</Link>
            <Link to="/explore" className={cx(btn.base, btn.onDark, btn.lg)}>Explore events</Link>
          </div>
        </div>
      </div>
    </div>);

}