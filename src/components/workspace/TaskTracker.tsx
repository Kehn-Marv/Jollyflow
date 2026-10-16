import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Loader2, Plus, Trash2 } from 'lucide-react';
import type { EventRecord, Task } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { dueLabel, isPast } from '../../utils/dates';
import { Button } from '../ui/Button';
import { TaskDialog } from './TaskDialog';
import { btn, cx } from '../../utils/styles';

export function TaskTracker({ event }: {event: EventRecord;}) {
  const db = useDb();
  const { pending, run } = useAsyncAction();
  const [params] = useSearchParams();
  const highlight = params.get('task');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [showDone, setShowDone] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const tasks = db.tasks.filter((t) => t.eventId === event.id);
  const open = tasks.filter((t) => t.status !== 'done').sort((a, b) => (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9'));
  const done = tasks.filter((t) => t.status === 'done');
  const visible = showDone ? [...open, ...done] : open;

  // Focus the input when arriving from “Add task” links (?new=1)
  useEffect(() => {
    if (params.get('new') === '1') input.current?.focus();
  }, [params]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const clean = title.trim();
    if (clean.length < 2) return setError('Give the task a short name.');
    setError('');
    const ok = await run(
      () => service.createTask({ eventId: event.id, title: clean, details: '', priority: 'medium', assigneeId: null, dueDate: null, category: 'General' }),
      { success: 'Task added' }
    );
    if (ok) {
      setTitle('');
      input.current?.focus();
    }
  }

  const toggle = (t: Task) =>
  run(() => service.setTaskStatus(t.id, t.status === 'done' ? 'todo' : 'done').then(() => true), { success: t.status === 'done' ? 'Task reopened' : 'Task done' });

  return (
    <section aria-labelledby="task-tracker" className="rounded-3xl border border-line bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="task-tracker" className="font-display text-[15px] font-semibold text-ink">Task Tracker</h2>
          <p className="mt-0.5 text-xs text-smoke">{done.length} of {tasks.length} done</p>
        </div>
        <Button type="button" onClick={() => input.current?.focus()} className={cx(btn.base, btn.outline, btn.sm)}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add Task
        </Button>
      </div>

      <form onSubmit={add} noValidate className="mt-4">
        <label htmlFor={`new-task-${event.id}`} className="sr-only">New task</label>
        <div className={cx('flex items-center gap-2 rounded-2xl border bg-paper py-1.5 pl-4 pr-1.5 transition focus-within:border-ink focus-within:bg-white', error ? 'border-danger' : 'border-line')}>
          <input
            ref={input}
            id={`new-task-${event.id}`}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            placeholder="Add a task to start planning"
            maxLength={120}
            enterKeyHint="done"
            aria-invalid={!!error}
            className="h-9 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-smoke sm:text-sm" />
          
          <Button type="submit" disabled={pending || !title.trim()} aria-label="Add task" className={cx(btn.base, btn.ink, btn.sm, 'h-9 px-3.5')}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>
        {error && <p role="alert" className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
      </form>

      {visible.length ?
      <ul className="mt-3 space-y-0.5">
          {visible.map((t) => {
          const isDone = t.status === 'done';
          const overdue = !isDone && t.dueDate && isPast(t.dueDate);
          return (
            <li key={t.id} className={cx('group -mx-2 flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-paper', highlight === t.id && 'bg-lime/30')}>
                <button
                type="button"
                onClick={() => toggle(t)}
                aria-label={isDone ? `Mark “${t.title}” as not done` : `Mark “${t.title}” as done`}
                aria-pressed={isDone}
                className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-md border transition', isDone ? 'border-ink bg-ink text-paper' : 'border-line bg-white hover:border-ink')}>
                
                  {isDone && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
                <button
                type="button"
                onClick={() => setEditing(t)}
                className={cx('min-w-0 flex-1 truncate text-left text-sm underline-offset-4 hover:underline', isDone ? 'text-smoke line-through' : 'text-ink')}>
                
                  {t.title}
                </button>
                {t.dueDate && !isDone && <span className={cx('shrink-0 text-xs', overdue ? 'font-medium text-danger' : 'text-smoke')}>{overdue ? 'Overdue' : dueLabel(t.dueDate)}</span>}
                <button
                type="button"
                onClick={() => run(() => service.deleteTask(t.id).then(() => true), { success: 'Task removed' })}
                aria-label={`Delete “${t.title}”`}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-smoke opacity-0 transition hover:bg-white hover:text-danger focus:opacity-100 group-hover:opacity-100">
                
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>);

        })}
        </ul> :

      <p className="mt-4 rounded-2xl bg-paper px-4 py-6 text-center text-sm text-smoke">{tasks.length ? 'Every task is done. Nice work.' : 'No tasks yet. Add the first one above.'}</p>
      }

      {done.length > 0 &&
      <button type="button" onClick={() => setShowDone((s) => !s)} className="mt-3 text-xs font-medium text-smoke underline-offset-4 hover:text-ink hover:underline">
          {showDone ? 'Hide completed' : `Show completed (${done.length})`}
        </button>
      }

      <TaskDialog event={event} task={editing} open={!!editing} onOpenChange={(o) => !o && setEditing(null)} />
    </section>);

}