import React, { useState } from 'react';
import { ChevronRight, Mail, Phone, UserPlus } from 'lucide-react';
import type { Collaborator, CollaboratorRole, EventRecord } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '../../utils/events';
import { isEmail } from '../../utils/validation';
import { FormDialog } from '../ui/FormDialog';
import { FormField, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { SidePanel } from '../ui/SidePanel';
import { StatusPill } from '../ui/StatusPill';
import { btn, cx, inputClass } from '../../utils/styles';

const ROLES: CollaboratorRole[] = ['planner', 'co_host', 'finance', 'vendor_manager', 'viewer'];
const EMPTY = { name: '', phone: '', email: '', role: 'planner' as CollaboratorRole };

const roleLabel = (c: Collaborator) => c.role === 'owner' ? 'Creator' : ROLE_LABELS[c.role];
const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
const isPhone = (v: string) => /^\+?\d{10,14}$/.test(v.replace(/[\s-]/g, ''));

export function PlannersCard({ event }: {event: EventRecord;}) {
  const db = useDb();
  const { pending, run } = useAsyncAction();
  const team = db.collaborators.
  filter((c) => c.eventId === event.id).
  sort((a, b) => a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : 0);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = team.find((c) => c.id === selectedId) ?? null;

  async function add() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Enter a name.';
    if (!isPhone(form.phone)) e.phone = 'Enter a valid phone number, e.g. 0803 412 7765.';
    if (!isEmail(form.email)) e.email = 'Enter a valid email.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const ok = await run(() => service.inviteCollaborator(event.id, form), { success: `${form.name.trim()} added as a planner (simulated invite)` });
    if (ok) {
      setAddOpen(false);
      setForm(EMPTY);
    }
  }

  return (
    <section aria-labelledby="planners-title" className="rounded-3xl border border-line bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="planners-title" className="font-display text-[15px] font-semibold text-ink">Planners</h2>
          <p className="mt-0.5 text-xs text-smoke">{team.length} {team.length === 1 ? 'person' : 'people'} on this event</p>
        </div>
        <Button type="button" onClick={() => {setErrors({});setAddOpen(true);}} className={cx(btn.base, btn.outline, btn.sm)}>
          <UserPlus className="h-4 w-4" aria-hidden="true" /> Add Planner
        </Button>
      </div>

      <ul className="mt-4 space-y-0.5">
        {team.map((c) =>
        <li key={c.id}>
            <button type="button" onClick={() => setSelectedId(c.id)} className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-paper">
              <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold', c.isYou ? 'bg-coral text-ink' : 'bg-ink text-paper')}>{initials(c.name)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{c.name}{c.isYou ? ' (you)' : ''}</span>
                <span className="block truncate text-xs text-smoke">
                  {roleLabel(c)}{c.status === 'invited' ? ' · invited' : ''}
                </span>
              </span>
              <span className="hidden shrink-0 text-xs tabular-nums text-smoke sm:block">{c.phone ?? 'No phone'}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-smoke" aria-hidden="true" />
            </button>
          </li>
        )}
      </ul>

      <FormDialog open={addOpen} onOpenChange={setAddOpen} title="Add a planner" description="They’ll be invited to help run this event. Demo mode: no message is sent." submitLabel="Add planner" pending={pending} onSubmit={add}>
        <FormField label="Full name" htmlFor="pl-name" error={errors.name}>
          <Input {...fieldA11y('pl-name', errors.name)} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" className={inputClass} autoFocus />
        </FormField>
        <FormField label="Phone number" htmlFor="pl-phone" error={errors.phone}>
          <Input {...fieldA11y('pl-phone', errors.phone)} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0803 412 7765" className={inputClass} />
        </FormField>
        <FormField label="Email" htmlFor="pl-email" error={errors.email}>
          <Input {...fieldA11y('pl-email', errors.email)} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
        </FormField>
        <FormField label="Role" htmlFor="pl-role" hint={ROLE_DESCRIPTIONS[form.role]}>
          <NativeSelect id="pl-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as CollaboratorRole })} aria-describedby="pl-role-hint">
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </NativeSelect>
        </FormField>
      </FormDialog>

      <SidePanel
        open={!!selected}
        onOpenChange={(o) => !o && setSelectedId(null)}
        title={selected ? `${selected.name}${selected.isYou ? ' (you)' : ''}` : 'Planner'}
        description={selected ? roleLabel(selected) : undefined}
        eyebrow={selected && <StatusPill tone={selected.status === 'active' ? 'success' : 'neutral'}>{selected.status === 'active' ? 'Active' : 'Invite pending'}</StatusPill>}>
        
        {selected &&
        <div className="space-y-5 p-6">
            <dl className="divide-y divide-line rounded-2xl border border-line text-sm">
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="flex items-center gap-2 text-smoke"><Phone className="h-4 w-4" aria-hidden="true" /> Phone</dt>
                <dd className="text-right tabular-nums text-ink">{selected.phone ? <a href={`tel:${selected.phone.replace(/\s/g, '')}`} className="hover:underline">{selected.phone}</a> : 'Not added'}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="flex items-center gap-2 text-smoke"><Mail className="h-4 w-4" aria-hidden="true" /> Email</dt>
                <dd className="min-w-0 truncate text-right text-ink"><a href={`mailto:${selected.email}`} className="hover:underline">{selected.email}</a></dd>
              </div>
            </dl>
            <p className="text-sm text-smoke">{selected.role === 'owner' ? 'Created this event and has full access.' : ROLE_DESCRIPTIONS[selected.role]}</p>
            {!selected.isYou && selected.role !== 'owner' &&
          <Button
            type="button"
            disabled={pending}
            onClick={async () => {
              const ok = await run(() => service.removeCollaborator(selected.id).then(() => true), { success: `${selected.name} removed` });
              if (ok) setSelectedId(null);
            }}
            className={cx(btn.base, btn.outline, btn.md, 'w-full text-danger')}>
            
                Remove from event
              </Button>
          }
          </div>
        }
      </SidePanel>
    </section>);

}