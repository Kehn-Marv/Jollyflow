import React from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '../../components/marketing/PageHero';
import { ModuleChecklist } from '../../components/marketing/ModuleChecklist';
import { RsvpVisual } from '../../components/home/visuals/RsvpVisual';
import { GiftVisual } from '../../components/home/visuals/GiftVisual';
import { btn, cx } from '../../utils/styles';

const STEPS = [
['Pick “Birthday” or “Party”', 'We skip vendors and tickets unless you want them.'],
['Add your wishlist', 'A couple of gifts and maybe a cash fund.'],
['Share one link', 'Friends RSVP and see what’s already reserved.']];


export function UseCaseParties() {
  return (
    <>
      <PageHero
        tone="pink"
        eyebrow="Use case · Birthdays & parties"
        title={<>The fun part, minus the follow-ups.</>}
        body="Light setup for house parties, milestone birthdays and dinners. One link for RSVPs and gifts, and a headcount you can trust."
        actions={<><Link to="/app/events/new?type=birthday" className={cx(btn.base, btn.ink, btn.lg)}>Plan a party</Link><Link to="/events/kemi-turns-30" className={cx(btn.base, btn.outline, btn.lg)}>See a sample invite</Link></>}
        visual={<RsvpVisual eventId="e_birthday" />} />
      
      <section className="bg-paper">
        <div className="container grid items-center gap-12 py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">Set up in three steps</h2>
            <ol className="mt-8 space-y-3">
              {STEPS.map(([t, b], i) =>
              <li key={t} className="flex items-start gap-4 rounded-[1.4rem] border-2 border-ink bg-white p-4 shadow-pop">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-lime font-display font-bold">{i + 1}</span>
                  <span><span className="block font-semibold text-ink">{t}</span><span className="text-sm text-smoke">{b}</span></span>
                </li>
              )}
            </ol>
          </div>
          <GiftVisual />
        </div>
      </section>
      <section className="border-t-2 border-ink bg-white">
        <div className="container max-w-3xl py-20">
          <ModuleChecklist
            title="A party workspace turns on"
            note="Vendors are optional — add a cake or decorator if you need one."
            features={{ guests: true, vendors: false, tickets: false, gifting: true, memories: true }} />
          
        </div>
      </section>
    </>);

}