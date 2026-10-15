import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, HandCoins, Shirt, Users } from 'lucide-react';
import { PageHero } from '../../components/marketing/PageHero';
import { ModuleChecklist } from '../../components/marketing/ModuleChecklist';
import { MoneyVisual } from '../../components/home/visuals/MoneyVisual';
import { images } from '../../data/images';
import { btn, cx } from '../../utils/styles';

const NEEDS = [
{ icon: Users, title: 'Two families, one guest list', body: 'Group guests by bride’s family, groom’s family, friends and work, with plus-ones counted properly.' },
{ icon: Crown, title: 'Many vendors, many deposits', body: 'Decor, catering, photo, makeup, canopies — each booking with its own deposit and balance dates.' },
{ icon: HandCoins, title: 'Family contributions', body: 'Record contributions from relatives separately from spending, with pending clearly marked.' },
{ icon: Shirt, title: 'Aso-ebi and programme', body: 'Tasks for collection days, fittings and the order of programme, with owners.' }];


export function UseCaseWeddings() {
  return (
    <>
      <PageHero
        tone="coral"
        eyebrow="Use case · Weddings"
        title={<>Big day. Bigger spreadsheet? Not anymore.</>}
        body="Traditional, white or both — keep families, vendors and money coordinated without a dozen group chats."
        actions={<><Link to="/app/events/new?type=wedding" className={cx(btn.base, btn.ink, btn.lg)}>Plan a wedding</Link><Link to="/signin" className={cx(btn.base, btn.outline, btn.lg)}>Sign in</Link></>}
        visual={<img src={images.wedding} alt="Couple in coordinated aso-oke at their reception" className="aspect-[4/3] w-full rounded-[1.6rem] border-2 border-ink object-cover shadow-pop-lg" />} />
      
      <section className="bg-paper">
        <div className="container py-20">
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">What weddings need</h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NEEDS.map(({ icon: Icon, title, body }) =>
            <li key={title} className="rounded-[1.4rem] border-2 border-ink bg-white p-5 shadow-pop">
                <Icon className="h-6 w-6 text-coral" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-smoke">{body}</p>
              </li>
            )}
          </ul>
        </div>
      </section>
      <section className="border-t-2 border-ink bg-white">
        <div className="container grid items-start gap-10 py-20 lg:grid-cols-2">
          <ModuleChecklist
            title="A wedding workspace turns on"
            note="Tickets stay off — weddings run on invitations."
            features={{ guests: true, vendors: true, tickets: false, gifting: true, memories: true }} />
          
          <div>
            <p className="mb-4 text-sm font-semibold text-smoke">The sample wedding’s money, live:</p>
            <MoneyVisual eventId="e_wedding" />
          </div>
        </div>
      </section>
    </>);

}