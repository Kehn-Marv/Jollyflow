import React from 'react';
import { FileSpreadsheet, MessageCircle, Receipt, StickyNote } from 'lucide-react';
import { problemFragments } from '../../data/marketing';
import { cx } from '../../utils/styles';
const ICON = {
  chat: MessageCircle,
  receipt: Receipt,
  file: FileSpreadsheet,
  note: StickyNote
};
export function ProblemSection() {
  return <section className="relative overflow-hidden rounded-b-[2.5rem] bg-paper" aria-labelledby="problem-title">
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      
    </section>;
}