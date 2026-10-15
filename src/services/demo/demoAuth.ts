import type { AuthService } from '../contracts';
import type { UserProfile } from '../../types/domain';
import { createId } from '../../utils/ids';

/**
 * PROTOTYPE AUTH ONLY. Passwords are validated for shape but never stored or verified.
 * Profiles live in localStorage. This is NOT secure authentication and must be
 * replaced by the backend auth service before any real use.
 */
const SESSION_KEY = 'jolliflow.demo.session';
const ACCOUNTS_KEY = 'jolliflow.demo.accounts';

const wait = (ms = 700) => new Promise((r) => setTimeout(r, ms));

export const DEMO_PROFILE: UserProfile = {
  id: 'u_demo',
  name: 'Ada Okafor',
  email: 'ada@demo.jolliflow.ng',
  businessName: 'Ada Okafor Events (sample)',
  city: 'Lagos',
  roles: ['planner', 'host'],
  primaryNeed: 'Run several client events at once',
  onboarded: true,
  isDemo: true,
  notificationPrefs: { deadlines: true, payments: true, rsvps: true, weeklyDigest: false },
  createdAt: new Date().toISOString()
};

function readAccounts(): UserProfile[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed as UserProfile[] : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: UserProfile[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function setSession(profile: UserProfile | null) {
  if (profile) localStorage.setItem(SESSION_KEY, JSON.stringify(profile));else
  localStorage.removeItem(SESSION_KEY);
}

export const demoAuth: AuthService = {
  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as UserProfile;
      return parsed && typeof parsed.email === 'string' ? parsed : null;
    } catch {
      return null;
    }
  },
  async signIn(email, password) {
    await wait();
    const normalised = email.trim().toLowerCase();
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    if (normalised === DEMO_PROFILE.email) {
      setSession(DEMO_PROFILE);
      return DEMO_PROFILE;
    }
    const account = readAccounts().find((a) => a.email === normalised);
    if (!account) throw new Error('We couldn’t find a prototype account for that email. Create one, or explore the live demo.');
    setSession(account);
    return account;
  },
  async signUp({ name, email }) {
    await wait();
    const normalised = email.trim().toLowerCase();
    const accounts = readAccounts();
    if (accounts.some((a) => a.email === normalised) || normalised === DEMO_PROFILE.email) {
      throw new Error('An account with this email already exists on this device. Try signing in.');
    }
    const profile: UserProfile = {
      ...DEMO_PROFILE,
      id: createId('u'),
      name: name.trim(),
      email: normalised,
      businessName: '',
      roles: [],
      primaryNeed: '',
      onboarded: false,
      isDemo: false,
      createdAt: new Date().toISOString()
    };
    writeAccounts([...accounts, profile]);
    setSession(profile);
    return profile;
  },
  async enterDemo() {
    await wait(400);
    setSession(DEMO_PROFILE);
    return DEMO_PROFILE;
  },
  async requestPasswordReset() {
    await wait();
  },
  async updateProfile(patch) {
    await wait(300);
    const current = demoAuth.getSession();
    if (!current) throw new Error('You are signed out.');
    const next = { ...current, ...patch };
    setSession(next);
    if (!next.isDemo) writeAccounts(readAccounts().map((a) => a.id === next.id ? next : a));
    return next;
  },
  async signOut() {
    await wait(200);
    setSession(null);
  }
};