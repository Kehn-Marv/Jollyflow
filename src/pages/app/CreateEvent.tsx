import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, History, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { FormDialog } from '../../components/ui/FormDialog';
import { StepOccasion } from '../../components/wizard/StepOccasion';
import { StepDetails } from '../../components/wizard/StepDetails';
import { StepGuests } from '../../components/wizard/StepGuests';
import { StepBudget } from '../../components/wizard/StepBudget';
import { StepPeople } from '../../components/wizard/StepPeople';
import { StepFeatures } from '../../components/wizard/StepFeatures';
import { StepReview } from '../../components/wizard/StepReview';
import { useWizardDraft } from '../../hooks/useWizardDraft';
import { service } from '../../services';
import type { EventType } from '../../types/domain';
import type { WizardField } from '../../types/wizard';
import { draftToInput, validateStep, WIZARD_STEPS, coverFor, defaultFeaturesFor, starterCategoriesFor, SAMPLE_BUDGETS } from '../../utils/wizard';
import { EVENT_TYPE_LABELS } from '../../utils/events';
import { btn, cx } from '../../utils/styles';

export function CreateEvent() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { draft, step, update, goTo, clear, resumed, dismissResumed } = useWizardDraft();
  const [errors, setErrors] = useState<Partial<Record<WizardField, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);

  // Preselect occasion from ?type= (e.g. from a use-case page) for a fresh draft.
  useEffect(() => {
    const t = params.get('type') as EventType | null;
    if (t && t in EVENT_TYPE_LABELS && !draft.type) {
      const sample = SAMPLE_BUDGETS[t] ?? 0;
      update({ type: t, features: defaultFeaturesFor(t), coverUrl: coverFor(t), categories: starterCategoriesFor(t, sample), budget: sample ? String(sample / 100) : '', visibility: t === 'concert' ? 'public' : 'private' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  function next() {
    const errs = validateStep(step, draft);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields.');
      return;
    }
    goTo(Math.min(step + 1, WIZARD_STEPS.length - 1));
  }

  function jump(target: number) {
    // Allow jumping back freely; forward only through validated steps.
    if (target <= step) return goTo(target);
    for (let s = step; s < target; s++) {
      const errs = validateStep(s, draft);
      if (Object.keys(errs).length) {
        setErrors(errs);
        goTo(s);
        return;
      }
    }
    goTo(target);
  }

  async function create() {
    if (submitting) return;
    for (let s = 0; s < WIZARD_STEPS.length - 1; s++) {
      const errs = validateStep(s, draft);
      if (Object.keys(errs).length) {
        setErrors(errs);
        goTo(s);
        toast.error(`Please complete “${WIZARD_STEPS[s]}”.`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const event = await service.createEvent(draftToInput(draft));
      clear();
      toast.success(`${event.title} ${event.status === 'published' ? 'is live' : 'saved as a draft'}.`);
      navigate(`/app/events/${event.id}`, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Couldn’t create the event.');
    } finally {
      setSubmitting(false);
    }
  }

  const props = { draft, update, errors };
  const isLast = step === WIZARD_STEPS.length - 1;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-smoke">Create event</p>
        <button type="button" onClick={() => setLeaveOpen(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-sand">
          <X className="h-4 w-4" aria-hidden="true" /> Cancel
        </button>
      </div>

      <nav aria-label="Wizard progress" className="mt-3">
        <ol className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {WIZARD_STEPS.map((label, i) =>
          <li key={label} className="min-w-[5.5rem] flex-1">
              <button type="button" onClick={() => jump(i)} aria-current={i === step ? 'step' : undefined} className="w-full text-left">
                <span className={cx('block h-1.5 rounded-full transition', i < step ? 'bg-ink' : i === step ? 'bg-coral' : 'bg-line')} />
                <span className={cx('mt-1.5 flex items-center gap-1 text-xs font-medium', i === step ? 'text-ink' : 'text-smoke')}>
                  {i < step && <Check className="h-3 w-3" aria-hidden="true" />}
                  {label}
                </span>
              </button>
            </li>
          )}
        </ol>
      </nav>

      {resumed &&
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-ink bg-sky/40 p-3 text-sm" role="status">
          <History className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">We restored your unfinished draft{draft.title ? ` “${draft.title}”` : ''}.</span>
          <button type="button" onClick={dismissResumed} className="font-semibold underline">Keep going</button>
          <button type="button" onClick={() => {clear();setErrors({});}} className="font-semibold underline">Start over</button>
        </div>
      }

      <div ref={headingRef} tabIndex={-1} className="mt-6 rounded-[1.6rem] border border-line bg-paper p-1 outline-none sm:p-2">
        <div className="rounded-[1.3rem] bg-paper p-3 sm:p-5">
          {step === 0 && <StepOccasion {...props} />}
          {step === 1 && <StepDetails {...props} />}
          {step === 2 && <StepGuests {...props} />}
          {step === 3 && <StepBudget {...props} />}
          {step === 4 && <StepPeople {...props} />}
          {step === 5 && <StepFeatures {...props} />}
          {step === 6 && <StepReview draft={draft} update={update} onEdit={jump} />}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
        <Button type="button" onClick={() => {setErrors({});goTo(Math.max(0, step - 1));}} disabled={step === 0 || submitting} className={cx(btn.base, btn.ghost, btn.md)}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
        </Button>
        {isLast ?
        <Button type="button" onClick={create} disabled={submitting} aria-busy={submitting} className={cx(btn.base, btn.lime, btn.md)}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {draft.publish ? 'Create & publish' : 'Save draft event'}
          </Button> :

        <Button type="button" onClick={next} className={cx(btn.base, btn.ink, btn.md)}>
            Next <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        }
      </div>

      <FormDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Leave event setup?"
        description="Nothing has been created or published yet."
        submitLabel="Discard draft"
        destructive
        onSubmit={() => {clear();setLeaveOpen(false);navigate('/app');}}>
        
        <p className="text-sm text-smoke">Discard removes your answers. Or keep the draft and come back later — we’ll restore it.</p>
        <button type="button" onClick={() => {setLeaveOpen(false);navigate('/app');}} className={cx(btn.base, btn.outline, btn.md, 'w-full')}>
          Keep draft and leave
        </button>
      </FormDialog>
    </div>);

}