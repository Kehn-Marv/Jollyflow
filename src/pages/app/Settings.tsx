import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { service, DATA_MODE } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { ToggleRow } from '../../components/ui/ToggleRow';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '../../utils/events';
import type { CollaboratorRole, NotificationPrefs } from '../../types/domain';
import { btn, cx, inputClass } from '../../utils/styles';

export function Settings() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { pending, run } = useAsyncAction();
  const [name, setName] = useState(user?.name ?? '');
  const [business, setBusiness] = useState(user?.businessName ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [resetOpen, setResetOpen] = useState(false);
  if (!user) return null;
  const prefs = user.notificationPrefs;
  const setPref = (k: keyof NotificationPrefs, v: boolean) => run(() => updateProfile({ notificationPrefs: { ...prefs, [k]: v } }), { success: 'Preference saved' });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-ink">Settings</h1>
      <section className="rounded-[1.4rem] border border-line bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Profile</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(e) => {e.preventDefault();if (name.trim().length < 2) return toast.error('Enter your name.');run(() => updateProfile({ name: name.trim(), businessName: business.trim(), city: city.trim() }), { success: 'Profile saved' });}}>
          <FormField label="Name" htmlFor="s-name"><input id="s-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></FormField>
          <FormField label="Email" htmlFor="s-email" hint="Prototype accounts can’t change email."><input id="s-email" value={user.email} readOnly className={cx(inputClass, 'bg-sand')} aria-describedby="s-email-hint" /></FormField>
          <FormField label="Business name" htmlFor="s-biz" optional><input id="s-biz" value={business} onChange={(e) => setBusiness(e.target.value)} className={inputClass} /></FormField>
          <FormField label="City" htmlFor="s-city" optional><input id="s-city" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} /></FormField>
          <Button type="submit" disabled={pending} className={cx(btn.base, btn.ink, btn.md, 'sm:col-span-2 sm:justify-self-start')}>Save profile</Button>
        </form>
        <p className="mt-4 text-xs text-smoke">Account type: {user.isDemo ? 'Shared demo account' : 'Prototype account on this device'} · Data mode: {DATA_MODE} (localStorage)</p>
      </section>
      <section className="rounded-[1.4rem] border border-line bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Notifications</h2>
        <p className="text-sm text-smoke">Saved preferences. Delivery (email/SMS/WhatsApp) arrives with the backend.</p>
        <div className="mt-4 space-y-2">
          <ToggleRow label="Deadlines & overdue tasks" checked={prefs.deadlines} onChange={(v) => setPref('deadlines', v)} />
          <ToggleRow label="Payments & deposits" checked={prefs.payments} onChange={(v) => setPref('payments', v)} />
          <ToggleRow label="RSVP responses" checked={prefs.rsvps} onChange={(v) => setPref('rsvps', v)} />
          <ToggleRow label="Weekly digest" checked={prefs.weeklyDigest} onChange={(v) => setPref('weeklyDigest', v)} />
        </div>
      </section>
      <section className="rounded-[1.4rem] border border-line bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Team permissions</h2>
        <p className="text-sm text-smoke">Roles are assigned per event from each event’s Updates & team tab.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">{(Object.keys(ROLE_LABELS) as CollaboratorRole[]).map((r) => <li key={r} className="rounded-xl bg-paper p-3"><p className="font-semibold">{ROLE_LABELS[r]}</p><p className="text-xs text-smoke">{ROLE_DESCRIPTIONS[r]}</p></li>)}</ul>
      </section>
      <section id="data" className="scroll-mt-24 rounded-[1.4rem] border-2 border-danger/40 bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Demo data</h2>
        <p className="mt-1 text-sm text-smoke">Restore every sample event, guest, booking, transaction and ticket to a clean state with fresh dates. Events you created will be removed.</p>
        <Button type="button" onClick={() => setResetOpen(true)} className={cx(btn.base, btn.danger, btn.md, 'mt-4')}><RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset demo data</Button>
      </section>
      <ConfirmDialog open={resetOpen} onOpenChange={setResetOpen} title="Reset all demo data?" message="All changes made in this browser will be replaced with the original sample universe." confirmLabel="Reset everything" pending={pending}
      onConfirm={async () => {const ok = await run(() => service.resetDemo().then(() => true), { success: 'Demo data reset' });if (ok) {localStorage.removeItem('jolliflow.wizard.draft');setResetOpen(false);navigate('/app');}}} />
    </div>);

}