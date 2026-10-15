import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Briefcase, CalendarPlus, Check, Gift, LayoutDashboard, Loader2, PartyPopper, Store, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '../../components/brand/Logo';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/domain';
import { btn, cx } from '../../utils/styles';

const ROLES: Array<{id: UserRole;label: string;body: string;icon: typeof Briefcase;}> = [
{ id: 'planner', label: 'Professional planner', body: 'I run events for clients', icon: Briefcase },
{ id: 'host', label: 'Host', body: 'I’m planning my own celebration', icon: PartyPopper },
{ id: 'vendor', label: 'Vendor', body: 'I provide services for events', icon: Store },
{ id: 'contributor', label: 'Guest or contributor', body: 'I attend, gift or contribute', icon: Gift }];


const NEEDS = [
{ id: 'Run several client events at once', icon: LayoutDashboard },
{ id: 'Keep track of vendors and payments', icon: Store },
{ id: 'Manage guests and RSVPs', icon: PartyPopper },
{ id: 'Sell tickets and check people in', icon: Ticket }];


export function Onboarding() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [roles, setRoles] = useState<UserRole[]>(user?.roles ?? []);
  const [need, setNeed] = useState(user?.primaryNeed ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  function toggleRole(r: UserRole) {
    setRoles((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);
    setError('');
  }

  function next() {
    if (step === 0 && roles.length === 0) return setError('Choose at least one option.');
    if (step === 1 && !need) return setError('Choose what matters most right now.');
    setError('');
    setStep((s) => s + 1);
  }

  async function finish(to: string) {
    if (pending) return;
    setPending(true);
    try {
      await updateProfile({ roles, primaryNeed: need, onboarded: true });
      toast.success('You’re all set.');
      navigate(to, { replace: true });
    } catch {
      toast.error('Couldn’t save your preferences. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-paper">
      <header className="container flex h-16 items-center justify-between">
        <Logo />
        <p className="text-sm text-smoke">Step {step + 1} of 3</p>
      </header>
      <main className="container max-w-3xl py-10">
        <div className="mb-8 flex gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => <span key={i} className={cx('h-1.5 flex-1 rounded-full', i <= step ? 'bg-ink' : 'bg-line')} />)}
        </div>

        {step === 0 &&
        <section aria-labelledby="ob-1">
            <h1 id="ob-1" className="text-3xl font-bold text-ink sm:text-4xl">Hi {user?.name.split(' ')[0]}, what describes you best?</h1>
            <p className="mt-2 text-smoke">Pick all that apply — one account covers every role.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2" role="group" aria-label="Roles">
              {ROLES.map(({ id, label, body, icon: Icon }) => {
              const on = roles.includes(id);
              return (
                <button key={id} type="button" aria-pressed={on} onClick={() => toggleRole(id)} className={cx('flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition', on ? 'border-ink bg-lime shadow-pop' : 'border-line bg-white hover:border-ink')}>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-white"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="flex-1"><span className="block font-semibold text-ink">{label}</span><span className="text-sm text-ink/70">{body}</span></span>
                    {on && <Check className="h-5 w-5" aria-hidden="true" />}
                  </button>);

            })}
            </div>
          </section>
        }

        {step === 1 &&
        <section aria-labelledby="ob-2">
            <h1 id="ob-2" className="text-3xl font-bold text-ink sm:text-4xl">What do you need most right now?</h1>
            <p className="mt-2 text-smoke">We’ll point you to the right place first.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Primary need">
              {NEEDS.map(({ id, icon: Icon }) =>
            <button key={id} type="button" role="radio" aria-checked={need === id} onClick={() => {setNeed(id);setError('');}} className={cx('flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition', need === id ? 'border-ink bg-sky shadow-pop' : 'border-line bg-white hover:border-ink')}>
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="font-semibold text-ink">{id}</span>
                </button>
            )}
            </div>
          </section>
        }

        {step === 2 &&
        <section aria-labelledby="ob-3">
            <h1 id="ob-3" className="text-3xl font-bold text-ink sm:text-4xl">How would you like to start?</h1>
            <p className="mt-2 text-smoke">Your workspace already has a few sample events so you can see how everything connects.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button type="button" disabled={pending} onClick={() => finish('/app/events/new')} className="rounded-[1.4rem] border-2 border-ink bg-lime p-6 text-left shadow-pop transition hover:-translate-y-0.5 disabled:opacity-60">
                <CalendarPlus className="h-7 w-7" aria-hidden="true" />
                <span className="mt-4 block font-display text-xl font-semibold">Create my first event</span>
                <span className="mt-1 block text-sm text-ink/75">A guided setup — about two minutes.</span>
              </button>
              <button type="button" disabled={pending} onClick={() => finish('/app')} className="rounded-[1.4rem] border-2 border-ink bg-white p-6 text-left shadow-pop transition hover:-translate-y-0.5 disabled:opacity-60">
                <LayoutDashboard className="h-7 w-7" aria-hidden="true" />
                <span className="mt-4 block font-display text-xl font-semibold">Explore the workspace</span>
                <span className="mt-1 block text-sm text-smoke">Look around the sample events first.</span>
              </button>
            </div>
            {pending && <p className="mt-4 flex items-center gap-2 text-sm text-smoke" role="status"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…</p>}
          </section>
        }

        {error && <p role="alert" className="mt-4 text-sm font-medium text-danger">{error}</p>}

        <div className="mt-10 flex justify-between">
          <Button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className={cx(btn.base, btn.ghost, btn.md)}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </Button>
          {step < 2 &&
          <Button type="button" onClick={next} className={cx(btn.base, btn.ink, btn.md)}>
              Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          }
        </div>
      </main>
    </div>);

}