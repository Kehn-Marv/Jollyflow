import type { Guest } from '../types/domain';

export interface RsvpSummary {
  total: number;
  attending: number;
  pending: number;
  declined: number;
  /** attending guests plus their plus-ones */
  headcount: number;
  responseRate: number;
}

export function rsvpSummary(guests: Guest[]): RsvpSummary {
  const attending = guests.filter((g) => g.rsvp === 'attending');
  const pending = guests.filter((g) => g.rsvp === 'pending').length;
  const declined = guests.filter((g) => g.rsvp === 'declined').length;
  const total = guests.length;
  return {
    total,
    attending: attending.length,
    pending,
    declined,
    headcount: attending.reduce((acc, g) => acc + 1 + g.plusOnes, 0),
    responseRate: total ? (total - pending) / total * 100 : 0
  };
}

export function normaliseContact(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]/g, '');
}