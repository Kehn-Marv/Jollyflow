import React, { useState } from 'react';
import { Globe, Loader2, Lock, Megaphone, Trash2, UserPlus, X } from 'lucide-react';
import type { CollaboratorRole, EventRecord } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '../../utils/events';
import { timeAgo } from '../../utils/dates';
import { isEmail } from '../../utils/validation';
import { ActivityFeed } from '../activity/ActivityFeed';
import { FormDialog } from '../ui/FormDialog';
import { FormField, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { ToggleRow } from '../ui/ToggleRow';
import { StatusPill } from '../ui/StatusPill';
import { Button } from '../ui/Button';
import { btn, cx, inputClass } from '../../utils/styles';

const ROLES: CollaboratorRole[] = ['planner', 'co_host', 'finance', 'vendor_manager', 'viewer'];

export function UpdatesTab({ event }: {event: EventRecord;}) {
  const db = useDb();
  const { pending, run } = useAsyncAction();
  const team = db.collaborators.filter((c) => c.eventId === event.id);
  const posts = db.announcements.filter((a) => a.eventId === event.id);
  const activity = db.activities.filter((a) => a.eventId === event.id).slice(0, 20);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [postError, setPostError] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inv, setInv] = useState({ name: '', email: '', role: 'co_host' as CollaboratorRole });
  const [invErr, setInvErr] = useState<Record<string, string>>({});

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3 || body.trim().length < 3) return setPostError('Add a short title and message.');
    setPostError('');
    const ok = await run(() => service.postAnnouncement({ eventId: event.id, title, body, isPublic }), { success: isPublic ? 'Update posted to the public page' : 'Update posted to the team' });
    if (ok) {
      setTitle('');
      setBody('');
    }
  }

  async function invite() {
    const e: Record<string, string> = {};
    if (inv.name.trim().length < 2) e.name = 'Enter a name.';
    if (!isEmail(inv.email)) e.email = 'Enter a valid email.';
    setInvErr(e);
    if (Object.keys(e).length) return;
    const ok = await run(() => service.inviteCollaborator(event.id, inv), { success: `${inv.name.trim()} invited (simulated — no email sent)` });
    if (ok) {
      setInviteOpen(false);
      setInv({ name: '', email: '', role: 'co_host' });
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-5">
        <form onSubmit={post} noValidate className="rounded-[1.4rem] border-2 border-ink bg-white p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink"><Megaphone className="h-5 w-5" aria-hidden="true" /> Post an update</h2>
          <div className="mt-4 space-y-3">
            <label htmlFor="an-title" className="sr-only">Title</label>
            <input id="an-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title, e.g. Parking update" className={inputClass} />
            <label htmlFor="an-body" className="sr-only">Message</label>
            <Textarea id="an-body" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What should people know?" className="rounded-xl bg-white" />
            <ToggleRow label={isPublic ? 'Public update' : 'Team only'} description={isPublic ? 'Shown on the public event page.' : 'Visible to collaborators only.'} checked={isPublic} onChange={setIsPublic} />
            {postError && <p role="alert" className="text-sm font-medium text-danger">{postError}</p>}
            <Button type="submit" disabled={pending} className={cx(btn.base, btn.ink, btn.md)}>{pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Post update</Button>
          </div>
        </form>
        <section className="rounded-[1.4rem] border border-line bg-white p-5">
          <h3 className="font-display text-lg font-semibold text-ink">Updates</h3>
          {posts.length ?
          <ul className="mt-3 space-y-3">
              {posts.map((a) =>
            <li key={a.id} className="rounded-2xl bg-paper p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">{a.title}</p>
                      <p className="text-xs text-smoke">{a.author} · {timeAgo(a.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <StatusPill tone={a.isPublic ? 'info' : 'neutral'} icon={a.isPublic ? Globe : Lock}>{a.isPublic ? 'Public' : 'Team'}</StatusPill>
                      <button type="button" onClick={() => run(() => service.deleteAnnouncement(a.id).then(() => true), { success: 'Update removed' })} aria-label={`Delete update ${a.title}`} className="grid h-8 w-8 place-items-center rounded-lg text-smoke hover:bg-white hover:text-danger"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-ink">{a.body}</p>
                </li>
            )}
            </ul> :
          <p className="mt-3 text-sm text-smoke">No updates posted yet.</p>}
        </section>
      </div>
      <div className="space-y-5">
        <section className="rounded-[1.4rem] border border-line bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">Team</h3>
            <Button type="button" onClick={() => setInviteOpen(true)} className={cx(btn.base, btn.outline, btn.sm)}><UserPlus className="h-4 w-4" aria-hidden="true" /> Invite</Button>
          </div>
          <ul className="mt-3 space-y-2">
            {team.map((c) =>
            <li key={c.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-paper">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-paper">{c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{c.name}{c.isYou ? ' (you)' : ''}</p>
                  <p className="truncate text-xs text-smoke">{ROLE_LABELS[c.role]}{c.status === 'invited' ? ' · invite pending (simulated)' : ''}</p>
                </div>
                {!c.isYou && c.role !== 'owner' &&
              <button type="button" onClick={() => run(() => service.removeCollaborator(c.id).then(() => true), { success: `${c.name} removed` })} aria-label={`Remove ${c.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-danger"><X className="h-4 w-4" aria-hidden="true" /></button>
              }
              </li>
            )}
          </ul>
        </section>
        <section className="rounded-[1.4rem] border border-line bg-white p-5">
          <h3 className="font-display text-lg font-semibold text-ink">Activity</h3>
          <div className="mt-2"><ActivityFeed items={activity} /></div>
        </section>
      </div>

      <FormDialog open={inviteOpen} onOpenChange={setInviteOpen} title="Invite a collaborator" description="Demo mode: the invitation is recorded but no email is sent." submitLabel="Send invite" pending={pending} onSubmit={invite}>
        <FormField label="Name" htmlFor="inv-name" error={invErr.name}>
          <Input {...fieldA11y('inv-name', invErr.name)} value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} className={inputClass} autoFocus />
        </FormField>
        <FormField label="Email" htmlFor="inv-email" error={invErr.email}>
          <Input {...fieldA11y('inv-email', invErr.email)} type="email" value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} className={inputClass} />
        </FormField>
        <FormField label="Role" htmlFor="inv-role" hint={ROLE_DESCRIPTIONS[inv.role]}>
          <NativeSelect id="inv-role" value={inv.role} onChange={(e) => setInv({ ...inv, role: e.target.value as CollaboratorRole })} aria-describedby="inv-role-hint">
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </NativeSelect>
        </FormField>
      </FormDialog>
    </div>);

}