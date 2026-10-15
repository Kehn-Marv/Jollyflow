import type { Kobo } from '../types/domain';

const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

/** Convert whole naira to integer kobo. Use only for literals and parsed input. */
export function naira(amount: number): Kobo {
  return Math.round(amount * 100);
}

/** Format integer kobo as ₦ for display (whole naira). */
export function formatNaira(kobo: Kobo): string {
  return nairaFormatter.format(Math.round(kobo / 100)).replace('NGN', '₦').replace(/\u00a0/g, '');
}

function trim(value: number): string {
  return value.toFixed(value >= 100 ? 0 : 1).replace(/\.0$/, '');
}

/** Compact display: ₦18.5M, ₦450K. */
export function formatNairaCompact(kobo: Kobo): string {
  const sign = kobo < 0 ? '−' : '';
  const n = Math.abs(kobo) / 100;
  if (n >= 1_000_000_000) return `${sign}₦${trim(n / 1_000_000_000)}B`;
  if (n >= 1_000_000) return `${sign}₦${trim(n / 1_000_000)}M`;
  if (n >= 10_000) return `${sign}₦${trim(n / 1_000)}K`;
  return `${sign}${formatNaira(Math.abs(kobo))}`;
}

/**
 * Parse a user-entered naira string ("1,250,000" or "₦4500.50") into kobo
 * using integer arithmetic. Returns null if invalid.
 */
export function parseNairaInput(value: string): Kobo | null {
  const cleaned = value.replace(/[₦,\s]/g, '');
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const [whole, fraction = ''] = cleaned.split('.');
  const kobo = Number(whole) * 100 + Number((fraction + '00').slice(0, 2));
  return Number.isSafeInteger(kobo) ? kobo : null;
}

/** Turn kobo back into an editable naira string. */
export function koboToInput(kobo: Kobo): string {
  const whole = Math.floor(kobo / 100);
  const rem = kobo % 100;
  return rem ? `${whole}.${String(rem).padStart(2, '0')}` : String(whole);
}

export function sumKobo(values: Kobo[]): Kobo {
  return values.reduce((acc, v) => acc + v, 0);
}

/** Integer percentage, safe for zero denominators. */
export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round(part / whole * 100);
}