import { useCallback, useEffect, useRef, useState } from 'react';
import type { WizardDraft } from '../types/wizard';
import { emptyDraft } from '../utils/wizard';

const KEY = 'jolliflow.wizard.draft';

interface StoredDraft {
  draft: WizardDraft;
  step: number;
  savedAt: string;
}

function read(): StoredDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    return parsed && parsed.draft && typeof parsed.step === 'number' ? { ...parsed, draft: { ...emptyDraft(), ...parsed.draft } } : null;
  } catch {
    return null;
  }
}

/** Keeps the in-progress wizard in localStorage so it can be resumed after leaving or refreshing. */
export function useWizardDraft() {
  const initial = useRef(read());
  const [draft, setDraft] = useState<WizardDraft>(initial.current?.draft ?? emptyDraft());
  const [step, setStep] = useState<number>(initial.current?.step ?? 0);
  const [resumed, setResumed] = useState(Boolean(initial.current && initial.current.draft.type));
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) return;
    const t = window.setTimeout(() => {
      localStorage.setItem(KEY, JSON.stringify({ draft, step, savedAt: new Date().toISOString() } satisfies StoredDraft));
    }, 250);
    return () => window.clearTimeout(t);
  }, [draft, step]);

  const update = useCallback((patch: Partial<WizardDraft>) => {
    dirty.current = true;
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const goTo = useCallback((n: number) => {
    dirty.current = true;
    setStep(n);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    dirty.current = false;
    setDraft(emptyDraft());
    setStep(0);
    setResumed(false);
  }, []);

  return { draft, step, update, goTo, clear, resumed, dismissResumed: () => setResumed(false) };
}