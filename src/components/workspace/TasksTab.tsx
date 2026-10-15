import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, ClipboardList, Clock, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { EventRecord, Task } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { dueLabel, isPast } from '../../utils/dates';
import { TaskDialog } from './TaskDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { StatusPill, TASK_LABEL, TASK_TONE } from '../ui/StatusPill';
import { Button } from '../ui/Button';
import { btn, cx, inputClass } from '../../utils/styles';

const FILTERS = [
{ id: 'open', label: 'Open' },
{ id: 'overdue', label: 'Overdue' },
{ id: 'upcoming', label: 'Next 14 days' },
{ id: 'done', label: 'Completed' },
{ id: 'all', label: 'All' }] as
const;
type FilterId = (typeof FILTERS)[number]['id'];

function matches(t: Task, f: FilterId) {
  const overdue = t.status !== 'done' && !!t.dueDate && isPast(t.dueDate);
  if (f === 'open') return t.status !== 'done';
  if (f === 'overdue') return overdue;
  if (f === 'done') return t.status === 'done';
  if (f === 'upcoming') return t.status !== 'done' && !!t.dueDate && !overdue && new Date(t.dueDate).getTime() - Date.now() < 14 * 86_400_000;
  return true;
}

export function TasksTab({ event }: {event: EventRecord;}) {
  const db = useDb();
  const [params, setParams] = useSearchParams();
  const highlight = params.get('task');
  const [filter, setFilter] = useState<FilterId>(() => FILTERS.find((f) => f.id === params.get('filter'))?.id ?? 'open');
  const [q, setQ] = useState('');
  const [dialog, setDialog] = useState<{open: boolean;task: Task | null;}>({ open: params.get('new') === '1', task: null });
  const [toDelete, setToDelete] = useState<Task | null>(null);
  const { pending, run } = useAsyncAction();
  const [toggling, setToggling] = useState<string | null>(null);

  const all = db.tasks.filter((t) => t.eventId === event.id);
  const list = useMemo(
    () =>
    all.
    filter((t) => highlight && t.id === highlight || matches(t, filter)).
    filter((t) => !q || `${t.title} ${t.category}`.toLowerCase().includes(q.toLowerCase())).
    sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0) || (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9')),
    [all, filter, q, highlight]
  );

  useEffect(() => {
    if (params.get('new')) {
      const p = new URLSearchParams(params);
      p.delete('new');
      setParams(p, { replace: true });
    }
    if (highlight) window.setTimeout(() => document.getElementById(`task-${highlight}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(t: Task) {
    setToggling(t.id);
    await run(() => service.setTaskStatus(t.id, t.status === 'done' ? 'todo' : 'done'), { success: t.status === 'done' ? 'Task reopened' : 'Task completed' });
    setToggling(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Plan & tasks</h2>
          <p className="text-sm text-smoke">{all.filter((t) => t.status !== 'done').length} open · {all.filter((t) => matches(t, 'overdue')).length} overdue · {all.filter((t) => t.status === 'done').length} done</p>
        </div>
        <Button type="button" onClick={() => setDialog({ open: true, task: null })} className={cx(btn.base, btn.ink, btn.md)}><Plus className="h-4 w-4" aria-hidden="true" /> Add task</Button>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filter tasks">
          {FILTERS.map((f) =>
          <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={cx('whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold', filter === f.id ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink hover:border-ink')}>
              {f.label} <span className="opacity-60">{all.filter((t) => matches(t, f.id)).length}</span>
            </button>
          )}
        </div>
        <div className="relative lg:w-72">
          <label htmlFor="task-q" className="sr-only">Search tasks</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke" aria-hidden="true" />
          <input id="task-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks" className={cx(inputClass, 'h-10 pl-9')} />
        </div>
      </div>

      {list.length ?
      <ul className="overflow-hidden rounded-[1.4rem] border border-line bg-white">
          {list.map((t) => {
          const owner = db.collaborators.find((c) => c.id === t.assigneeId);
          const overdue = t.status !== 'done' && t.dueDate && isPast(t.dueDate);
          return (
            <li key={t.id} id={`task-${t.id}`} className={cx('flex items-start gap-3 border-b border-line p-4 last:border-0', highlight === t.id && 'bg-lime/25 ring-2 ring-inset ring-ink')}>
                <button type="button" onClick={() => toggle(t)} disabled={pending && toggling === t.id} aria-label={t.status === 'done' ? `Mark “${t.title}” as not done` : `Mark “${t.title}” as done`} className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-sand">
                  {t.status === 'done' ? <CheckCircle2 className="h-6 w-6 text-forest" aria-hidden="true" /> : <Circle className="h-6 w-6 text-smoke/50" aria-hidden="true" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cx('font-semibold', t.status === 'done' ? 'text-smoke line-through' : 'text-ink')}>{t.title}</p>
                  {t.details && <p className="mt-0.5 text-sm text-smoke">{t.details}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <StatusPill tone={TASK_TONE[t.status]}>{TASK_LABEL[t.status]}</StatusPill>
                    {t.priority === 'high' && <StatusPill tone="warning">High priority</StatusPill>}
                    <StatusPill>{t.category}</StatusPill>
                    {t.dueDate && <StatusPill tone={overdue ? 'danger' : 'neutral'} icon={Clock}>{overdue ? `Overdue · ${dueLabel(t.dueDate)}` : `Due ${dueLabel(t.dueDate)}`}</StatusPill>}
                    <span className="text-xs text-smoke">· {owner ? owner.name : 'Unassigned'}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => setDialog({ open: true, task: t })} aria-label={`Edit ${t.title}`} className="grid h-9 w-9 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-ink"><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" onClick={() => setToDelete(t)} aria-label={`Delete ${t.title}`} className="grid h-9 w-9 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-danger"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              </li>);

        })}
        </ul> :

      <EmptyState icon={ClipboardList} title="No tasks here" message={filter === 'overdue' ? 'Nothing overdue — nice.' : 'Add the first task for this event.'} action={<Button type="button" onClick={() => setDialog({ open: true, task: null })} className={cx(btn.base, btn.ink, btn.md)}>Add task</Button>} />
      }

      <TaskDialog event={event} task={dialog.task} open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete task?"
        message={`“${toDelete?.title}” will be removed.`}
        confirmLabel="Delete"
        pending={pending}
        onConfirm={async () => {
          if (!toDelete) return;
          const ok = await run(() => service.deleteTask(toDelete.id).then(() => true), { success: 'Task deleted' });
          if (ok) setToDelete(null);
        }} />
      
    </div>);

}