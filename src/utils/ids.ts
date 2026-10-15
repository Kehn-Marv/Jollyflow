const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomChars(length: number, alphabet = CODE_ALPHABET): string {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => alphabet[v % alphabet.length]).join('');
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${randomChars(5, 'abcdefghijkmnpqrstuvwxyz23456789')}`;
}

/** Demo payment reference, visibly marked as a simulation. */
export function createReference(prefix = 'JFDEMO'): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `${prefix}-${stamp}-${randomChars(6)}`;
}

/** Unique ticket code like JF-7Q2K-M8VA. Encoded in the ticket QR. */
export function createTicketCode(): string {
  return `JF-${randomChars(4)}-${randomChars(4)}`;
}

export function createIdempotencyKey(): string {
  return `idem_${randomChars(16)}`;
}

export function slugify(value: string): string {
  return value.
  toLowerCase().
  replace(/[’']/g, '').
  replace(/&/g, 'and').
  replace(/[^a-z0-9]+/g, '-').
  replace(/^-+|-+$/g, '').
  slice(0, 48);
}

export function normaliseTicketCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}