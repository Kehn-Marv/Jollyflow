import { images } from './images';

export const problemFragments = [
{ id: 'p1', kind: 'chat', text: 'Abeg who paid the DJ?? 🙏🏾', meta: 'Family Planning Committee · 214 unread', rotate: '-4deg', color: 'bg-white' },
{ id: 'p2', kind: 'receipt', text: 'Transfer ₦250,000 — narration: “deco”', meta: 'Which deco? Which event?', rotate: '3deg', color: 'bg-lime' },
{ id: 'p3', kind: 'file', text: 'guest_list_FINAL_v7 (2).xlsx', meta: 'Last edited by… someone', rotate: '-2deg', color: 'bg-sky' },
{ id: 'p4', kind: 'chat', text: 'Caterer: I need the final count by Friday o', meta: 'Message from 3 weeks ago', rotate: '5deg', color: 'bg-white' },
{ id: 'p5', kind: 'note', text: 'Deposit for decor??? due when??', meta: 'Notes app', rotate: '-6deg', color: 'bg-bloom' }];


export const workflowSteps = [
{ n: '01', title: 'Create the event', body: 'Pick the occasion, set the date, venue and budget. Turn on only what this event needs.', color: 'bg-lime' },
{ n: '02', title: 'Bring your people in', body: 'Invite co-hosts and a finance lead, assign tasks with owners and due dates.', color: 'bg-bloom' },
{ n: '03', title: 'Book vendors, follow money', body: 'Track bookings, deposits and balances. Planned, committed and paid stay separate.', color: 'bg-sky' },
{ n: '04', title: 'Invite, sell, check in', body: 'Share one link for RSVPs, gifts or tickets. Scan guests in on the day.', color: 'bg-coral' },
{ n: '05', title: 'Keep the memories', body: 'Collect photos in one gallery after the last song plays.', color: 'bg-white' }];


export const useCases = [
{ to: '/use-cases/weddings', label: 'Weddings', sub: 'Families, vendors and big budgets', image: images.wedding, block: 'bg-coral' },
{ to: '/use-cases/parties', label: 'Birthdays & parties', sub: 'RSVPs, wishlists and contributions', image: images.birthday, block: 'bg-bloom' },
{ to: '/use-cases/live-events', label: 'Live events', sub: 'Tickets, gates and crowd counts', image: images.concert, block: 'bg-sky' },
{ to: '/features/planning', label: 'Professional planners', sub: 'Many events, one clear view', image: images.corporate, block: 'bg-lime' }];


export const testimonials = [
{ name: 'Demo persona: wedding planner, Lagos', quote: 'I stopped asking “has anyone paid the decorator?” in four different group chats. The deposit alert just tells me.' },
{ name: 'Demo persona: birthday host, Abuja', quote: 'Friends could see what was already reserved, so I didn’t get three cameras and no casserole.' },
{ name: 'Demo persona: concert promoter, Lagos', quote: 'Ticket tiers, sales and the gate list finally agree with each other on the night.' },
{ name: 'Demo persona: family organiser, Enugu', quote: 'Every contribution has a name, an amount and a status. Pending is pending — no guessing.' }];


export const faqs = [
{ q: 'Who is JolliFlow for?', a: 'Hosts and professional planners running celebrations and live events, plus the guests, vendors and contributors around them. One person can be a host today and a guest tomorrow — it is one account.' },
{ q: 'Are my events private?', a: 'Each event is either public (listed on Explore) or private (reachable only through an invitation link). Budgets, guest lists, vendor terms and transactions are never shown on public event pages.' },
{ q: 'Do I need an account to RSVP or buy a ticket?', a: 'No. Guests can RSVP, register or check out from the public event page with just a name and contact. Organisers and collaborators need an account.' },
{ q: 'Can I sell tickets?', a: 'Yes, for events that need them. Create ticket tiers with prices and quantities, then validate tickets at the door. In this prototype every checkout is a clearly labelled simulation.' },
{ q: 'Does JolliFlow move real money today?', a: 'No. This is a frontend prototype. Payments, contributions and ticket sales are simulated with explicit success, pending and failure states. Real payments will be added later through a verified, server-side banking integration.' },
{ q: 'How much does it cost?', a: 'Pricing is not set yet. The prototype is free to explore, and you can reset the demo data at any time from Settings.' }];