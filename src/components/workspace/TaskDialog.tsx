import React, { useEffect, useState } from 'react';
import type { EventRecord, Task, TaskPriority, TaskStatus } from '../../types/domain';
import { FormDialog } from '../ui/FormDialog';
import { FormField, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { combineDateTime, toDateInput } from '../../utils/dates';
import { inputClass } from '../../utils/styles';

interface Props {
  event: EventRecord;
  task: Task | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function TaskDialog({ event, task, open, onOpenChange }: Props) {
  const db = useDb();
  const people = db.collaborators.filter((c) => c.eventId === event.id);
  const { pending, run } = useAsyncAction();
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? '');
    setDetails(task?.details ?? '');
    setAssigneeId(task?.assigneeId ?? '');
    setDue(toDateInput(task?.dueDate ?? null));
    setPriority(task?.priority ?? 'medium');
    setCategory(task?.category ?? '');
    setStatus(task?.status ?? 'todo');
    setError('');
  }, [open, task]);

  async function save() {
    if (title.trim().length < 2) return setError('Give the task a short title.');
    const input = { eventId: event.id, title, details, assigneeId: assigneeId || null, dueDate: due ? combineDateTime(due, '17:00') : null, priority, category: category.trim() || 'General', status };
    const ok = await run(() => task ? service.updateTask(task.id, input) : service.createTask(input), { success: task ? 'Task updated' : 'Task added' });
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={task ? 'Edit task' : 'Add a task'} submitLabel={task ? 'Save task' : 'Add task'} pending={pending} onSubmit={save}>
      <FormField label="Task" htmlFor="task-title" error={error}>
        <Input {...fieldA11y('task-title', error)} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Confirm DJ arrival time" className={inputClass} autoFocus />
      </FormField>
      <FormField label="Details" htmlFor="task-details" optional>
        <Textarea id="task-details" rows={2} value={details} onChange={(e) => setDetails(e.target.value)} className="rounded-xl bg-white" />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Assignee" htmlFor="task-assignee">
          <NativeSelect id="task-assignee" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Unassigned</option>
            {people.map((p) => <option key={p.id} value={p.id}>{p.name}{p.isYou ? ' (you)' : ''}</option>)}
          </NativeSelect>
        </FormField>
        <FormField label="Due date" htmlFor="task-due" optional>
          <Input id="task-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Priority" htmlFor="task-priority">
          <NativeSelect id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </NativeSelect>
        </FormField>
        <FormField label="Category" htmlFor="task-cat" optional>
          <Input id="task-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Vendors, Guests…" className={inputClass} />
        </FormField>
        {task &&
        <FormField label="Status" htmlFor="task-status">
            <NativeSelect id="task-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              <option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option>
            </NativeSelect>
          </FormField>
        }
      </div>
    </FormDialog>);

}