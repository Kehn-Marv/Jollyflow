import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, HandCoins, HeartHandshake, MapPin } from 'lucide-react';
import { PageHero } from '../../components/marketing/PageHero';
import { images } from '../../data/images';
import { btn, cx } from '../../utils/styles';

const VALUES = [
{ icon: Eye, title: 'Clarity over noise', body: 'Every screen answers “what’s next, who owns it, and what does it cost?”', color: 'bg-lime' },
{ icon: HandCoins, title: 'Honest money', body: 'Pending is pending. Estimates are not payments. We never blur the lines.', color: 'bg-coral' },
{ icon: HeartHandshake, title: 'Built for the whole crowd', body: 'Hosts, planners, vendors, guests and the aunties who contribute — one connected product.', color: 'bg-sky' },
{ icon: MapPin, title: 'Nigeria first', body: 'Naira by default, local event types, and the way people really coordinate here.', color: 'bg-bloom' }];


const STATUS = [
['Done', 'Responsive web app with planner workspace, public pages, RSVP, demo checkout and check-in'],
['Done', 'Typed service contracts so a real backend can plug in without rewriting the UI'],
['Next', 'Production backend, secure authentication and real message delivery'],
['Next', 'Verified, server-side payment integration subject to partner approval']];


export function About() {
  return (
    <>
      <PageHero
        eyebrow="About JolliFlow"
        title={<>We make celebrations easier to run.</>}
        body="JolliFlow is an event operations platform for Nigerian celebrations and live events, built by a two-person founding team for Wema Bank Hackaholics 7.0."
        visual={<img src={images.naming} alt="Family gathered at a naming ceremony in Enugu" className="aspect-[4/3] w-full rounded-[1.6rem] border-2 border-paper/20 object-cover" />} />
      
      <section className="bg-paper">
        <div className="container py-20">
          <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">Why we started</h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-smoke">
            Nigerian events are generous, joyful and complicated. Planning lives in group chats, money moves through dozens of transfers with vague narrations, and nobody has one view of what’s confirmed. We want the person holding it all together to sleep the night before the event.
          </p>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body, color }) =>
            <li key={title} className="rounded-[1.4rem] border-2 border-ink bg-white p-5 shadow-pop">
                <span className={cx('grid h-11 w-11 place-items-center rounded-full border-2 border-ink', color)}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-smoke">{body}</p>
              </li>
            )}
          </ul>
        </div>
      </section>
      <section className="border-t-2 border-ink bg-white">
        <div className="container grid gap-10 py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">Where we are</h2>
            <p className="mt-4 text-smoke">An honest status of the prototype you’re looking at.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/manifesto" className={cx(btn.base, btn.ink, btn.md)}>Read our manifesto</Link>
              <Link to="/explore" className={cx(btn.base, btn.outline, btn.md)}>Explore events</Link>
            </div>
          </div>
          <ul className="space-y-3">
            {STATUS.map(([tag, text]) =>
            <li key={text} className="flex items-start gap-3 rounded-2xl border border-line bg-paper p-4">
                <span className={cx('rounded-full px-2.5 py-0.5 text-xs font-bold', tag === 'Done' ? 'bg-forest text-paper' : 'bg-sand text-ink')}>{tag}</span>
                <span className="text-sm text-ink">{text}</span>
              </li>
            )}
          </ul>
        </div>
      </section>
    </>);

}