export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^(\+?234|0)[789][01]\d{8}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/** Accepts an email or a Nigerian phone number (spaces allowed). */
export function isContact(value: string): boolean {
  const v = value.trim();
  return isEmail(v) || PHONE_RE.test(v.replace(/[\s-]/g, ''));
}

export type Errors<T extends string> = Partial<Record<T, string>>;

export function hasErrors<T extends string>(errors: Errors<T>): boolean {
  return Object.values(errors).some(Boolean);
}