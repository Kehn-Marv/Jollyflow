import React from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import type { CollaboratorRole } from '../../types/domain';
import type { StepProps } from '../../types/wizard';
import { NativeSelect } from '../ui/FormField';
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '../../utils/events';
import { cx, inputClass } from '../../utils/styles';

const ROLES: CollaboratorRole[] = ['planner', 'co_host', 'finance', 'vendor_manager', 'viewer'];

export function StepPeople({ draft, update, errors }: StepProps) {
  const set = (id: string, patch: Partial<StepProps['draft']['collaborators'][number]>) =>
  update({ collaborators: draft.collaborators.map((c) => c.id === id ? { ...c, ...patch } : c) });

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink sm:text-3xl">People & responsibilities</h2>
      <p className="mt-1 text-smoke">Optional. Invite a co-host, finance lead or helper. You’ll be the owner.</p>
      {draft.collaborators.length === 0 ?
      <div className="mt-6 rounded-2xl border-2 border-dashed border-line bg-white/60 p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-smoke" aria-hidden="true" />
          <p className="mt-2 text-sm text-smoke">Planning solo for now? That’s fine — you can invite people later.</p>
        </div> :

      <ul className="mt-6 space-y-3">
          {draft.collaborators.map((c, i) =>
        <li key={c.id} className="grid gap-2 rounded-2xl border border-line bg-white p-3 sm:grid-cols-[1fr_1fr_11rem_auto]">
              <input value={c.name} onChange={(e) => set(c.id, { name: e.target.value })} placeholder="Name" aria-label={`Collaborator ${i + 1} name`} className={inputClass} />
              <input value={c.email} type="email" onChange={(e) => set(c.id, { email: e.target.value })} placeholder="Email" aria-label={`Collaborator ${i + 1} email`} className={inputClass} />
              <NativeSelect value={c.role} onChange={(e) => set(c.id, { role: e.target.value as CollaboratorRole })} aria-label={`Collaborator ${i + 1} role`}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </NativeSelect>
              <button type="button" onClick={() => update({ collaborators: draft.collaborators.filter((x) => x.id !== c.id) })} aria-label={`Remove collaborator ${i + 1}`} className="grid h-11 w-11 place-items-center rounded-xl text-smoke hover:bg-sand hover:text-danger">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="text-xs text-smoke sm:col-span-4">{ROLE_DESCRIPTIONS[c.role]}</p>
            </li>
        )}
        </ul>
      }
      <button
        type="button"
        onClick={() => update({ collaborators: [...draft.collaborators, { id: `col_${Date.now()}`, name: '', email: '', role: 'co_host' }] })}
        className={cx('mt-4 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-sand')}>
        
        <Plus className="h-4 w-4" aria-hidden="true" /> Add a person
      </button>
      {errors.collaborators && <p role="alert" className="mt-3 text-sm font-medium text-danger">{errors.collaborators}</p>}
      <p className="mt-4 text-xs text-smoke">Invitations are simulated in this prototype — no email is sent.</p>
    </div>);

}