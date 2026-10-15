import type { BookingStatus, CollaboratorRole, EventRecord, EventType, VendorCategory } from '../types/domain';
import { isPast } from './dates';

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  birthday: 'Birthday',
  wedding: 'Wedding',
  traditional_wedding: 'Traditional wedding',
  anniversary: 'Anniversary',
  party: 'Party',
  naming: 'Naming ceremony',
  graduation: 'Graduation',
  corporate: 'Corporate event',
  concert: 'Concert',
  community: 'Community event',
  custom: 'Custom event'
};

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  catering: 'Catering',
  decor: 'Decor & florals',
  photography: 'Photo & film',
  venue: 'Venue',
  audiovisual: 'Sound & AV',
  cake: 'Cakes & desserts',
  beauty: 'Makeup & beauty',
  entertainment: 'Live entertainment',
  rentals: 'Rentals'
};

export const ROLE_LABELS: Record<CollaboratorRole, string> = {
  owner: 'Owner',
  planner: 'Planner',
  co_host: 'Co-host',
  finance: 'Finance',
  vendor_manager: 'Vendor manager',
  viewer: 'Viewer'
};

export const ROLE_DESCRIPTIONS: Record<CollaboratorRole, string> = {
  owner: 'Full control, including deleting the event',
  planner: 'Manage everything except deleting the event',
  co_host: 'Guests, tasks and updates',
  finance: 'Budget, payments and contributions',
  vendor_manager: 'Vendors, bookings and related tasks',
  viewer: 'Read-only access'
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  requested: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  declined: 'Declined',
  cancelled: 'Cancelled'
};

export const CITIES = ['Lagos', 'Abuja', 'Enugu', 'Port Harcourt', 'Ibadan', 'Kano', 'Benin City', 'Calabar', 'Abeokuta', 'Owerri'];

export type PublicState = 'open' | 'draft' | 'cancelled' | 'ended' | 'archived';

export function publicState(event: EventRecord, now: Date = new Date()): PublicState {
  if (event.status === 'draft') return 'draft';
  if (event.status === 'cancelled') return 'cancelled';
  if (event.status === 'archived') return 'archived';
  if (isPast(event.endsAt, now)) return 'ended';
  return 'open';
}

export function publicEventUrl(event: Pick<EventRecord, 'slug'>, guestId?: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/events/${event.slug}${guestId ? `?invite=${guestId}` : ''}`;
}