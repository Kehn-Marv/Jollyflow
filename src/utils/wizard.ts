import type { CreateEventInput } from '../services/contracts';
import type { EventFeatures, EventType } from '../types/domain';
import type { WizardDraft, WizardField } from '../types/wizard';
import { coverOptions, images } from '../data/images';
import { combineDateTime } from './dates';
import { koboToInput, naira, parseNairaInput } from './money';
import { isEmail } from './validation';

export const WIZARD_STEPS = ['Occasion', 'Details', 'Guests & access', 'Budget', 'People', 'Features', 'Review'] as const;

export function defaultFeaturesFor(type: EventType): EventFeatures {
  switch (type) {
    case 'concert':
      return { guests: false, vendors: true, tickets: true, gifting: false, memories: true };
    case 'corporate':
    case 'community':
      return { guests: true, vendors: true, tickets: false, gifting: false, memories: false };
    case 'wedding':
    case 'traditional_wedding':
      return { guests: true, vendors: true, tickets: false, gifting: true, memories: true };
    case 'birthday':
    case 'party':
    case 'anniversary':
    case 'graduation':
    case 'naming':
      return { guests: true, vendors: false, tickets: false, gifting: true, memories: true };
    default:
      return { guests: true, vendors: false, tickets: false, gifting: false, memories: false };
  }
}

const STARTER: Partial<Record<EventType, Array<[string, number]>>> = {
  wedding: [['Venue', 30], ['Catering', 30], ['Decor', 20], ['Photo & film', 10], ['Attire', 5], ['Contingency', 5]],
  traditional_wedding: [['Venue', 20], ['Catering', 30], ['Decor', 15], ['Aso-oke & attire', 15], ['Bride price & gifts', 10], ['Contingency', 10]],
  concert: [['Venue', 35], ['Sound & lights', 30], ['Talent', 20], ['Marketing', 10], ['Security & gate', 5]],
  corporate: [['Venue', 40], ['Catering', 35], ['AV', 15], ['Branding', 10]]
};
const DEFAULT_STARTER: Array<[string, number]> = [['Venue', 35], ['Food & drinks', 40], ['Decor', 15], ['Extras', 10]];

export function starterCategoriesFor(type: EventType, budgetKobo: number): WizardDraft['categories'] {
  return (STARTER[type] ?? DEFAULT_STARTER).map(([name, pct], i) => ({
    id: `cat_${i}`,
    name,
    planned: budgetKobo ? koboToInput(Math.round(budgetKobo * pct / 100 / 100) * 100) : '',
    enabled: true
  }));
}

export function coverFor(type: EventType): string {
  const map: Partial<Record<EventType, string>> = {
    wedding: images.wedding, traditional_wedding: images.wedding, birthday: images.birthday, concert: images.concert,
    naming: images.naming, corporate: images.corporate, party: images.memories, community: images.decor
  };
  return map[type] ?? coverOptions[7].url;
}

export function emptyDraft(): WizardDraft {
  return {
    type: null, title: '', description: '', date: '', startTime: '16:00', endTime: '22:00', venue: '', city: 'Lagos', address: '',
    coverUrl: images.hero, visibility: 'private', rsvpEnabled: true, capacity: '', plusOnesAllowed: true, budget: '',
    categories: [], collaborators: [], features: defaultFeaturesFor('custom'),
    tier: { name: 'Regular', price: '', quantity: '' }, publish: true
  };
}

/** Returns end ISO; if end time is not after start, it rolls to the next day (late-night parties). */
export function computeTimes(d: WizardDraft): {startsAt: string;endsAt: string;overnight: boolean;} {
  const startsAt = combineDateTime(d.date, d.startTime);
  let endsAt = combineDateTime(d.date, d.endTime);
  const overnight = d.endTime <= d.startTime;
  if (overnight) endsAt = new Date(new Date(endsAt).getTime() + 86_400_000).toISOString();
  return { startsAt, endsAt, overnight };
}

export function validateStep(step: number, d: WizardDraft): Partial<Record<WizardField, string>> {
  const e: Partial<Record<WizardField, string>> = {};
  if (step === 0 && !d.type) e.type = 'Choose the occasion to continue.';
  if (step === 1) {
    if (d.title.trim().length < 3) e.title = 'Give your event a name (at least 3 characters).';
    if (!d.date) e.date = 'Choose a date.';else
    if (new Date(`${d.date}T23:59:59`) < new Date()) e.date = 'The date can’t be in the past.';
    if (!d.startTime) e.startTime = 'Add a start time.';
    if (!d.endTime) e.endTime = 'Add an end time.';
    if (!d.venue.trim()) e.venue = 'Add a venue name — “TBC” is fine for now.';
    if (!d.city) e.city = 'Choose a city.';
  }
  if (step === 2 && d.capacity.trim()) {
    const n = Number(d.capacity);
    if (!Number.isInteger(n) || n < 1 || n > 100_000) e.capacity = 'Enter a whole number between 1 and 100,000.';
  }
  if (step === 3) {
    if (d.budget.trim() && parseNairaInput(d.budget) === null) e.budget = 'Enter an amount in naira, e.g. 2500000.';
    const bad = d.categories.some((c) => c.enabled && (!c.name.trim() || c.planned.trim() !== '' && parseNairaInput(c.planned) === null));
    if (bad) e.categories = 'Each selected category needs a name and a valid amount.';
  }
  if (step === 4 && d.collaborators.some((c) => !c.name.trim() || !isEmail(c.email))) {
    e.collaborators = 'Each collaborator needs a name and a valid email.';
  }
  if (step === 5 && d.features.tickets) {
    if (!d.tier.name.trim()) e.tierName = 'Name the ticket tier.';
    const price = parseNairaInput(d.tier.price);
    if (price === null) e.tierPrice = 'Enter a price (0 for free).';
    const q = Number(d.tier.quantity);
    if (!Number.isInteger(q) || q < 1) e.tierQuantity = 'Enter how many tickets are available.';
  }
  return e;
}

export function draftToInput(d: WizardDraft): CreateEventInput {
  const { startsAt, endsAt } = computeTimes(d);
  return {
    title: d.title,
    type: d.type ?? 'custom',
    description: d.description,
    startsAt,
    endsAt,
    venue: d.venue,
    city: d.city,
    address: d.address,
    coverUrl: d.coverUrl,
    visibility: d.visibility,
    rsvpEnabled: d.features.guests && d.rsvpEnabled,
    capacity: d.capacity.trim() ? Number(d.capacity) : null,
    plusOnesAllowed: d.plusOnesAllowed,
    budgetTotal: parseNairaInput(d.budget) ?? 0,
    categories: d.categories.filter((c) => c.enabled && c.name.trim()).map((c) => ({ name: c.name.trim(), planned: parseNairaInput(c.planned) ?? 0 })),
    collaborators: d.collaborators.map(({ name, email, role }) => ({ name, email, role })),
    features: d.features,
    ticketTier: d.features.tickets ? { name: d.tier.name, price: parseNairaInput(d.tier.price) ?? 0, quantity: Number(d.tier.quantity) } : null,
    publish: d.publish
  };
}

export const SAMPLE_BUDGETS: Partial<Record<EventType, number>> = {
  wedding: naira(15_000_000), traditional_wedding: naira(8_000_000), concert: naira(10_000_000), corporate: naira(3_000_000), birthday: naira(1_500_000)
};