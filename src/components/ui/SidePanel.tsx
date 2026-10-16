import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './Sheet';
import { BodyPortal } from './BodyPortal';
import { cx } from '../../utils/styles';

interface SidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Rendered above the title (e.g. status pills) */
  eyebrow?: React.ReactNode;
  /** Pinned under the header, outside the scroll area (e.g. filter tabs) */
  toolbar?: React.ReactNode;
  /** Pinned at the bottom, outside the scroll area */
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: 'md' | 'lg';
}

/**
 * Floating right-side panel. It sits inset from every screen edge, keeps its header
 * (and optional toolbar/footer) fixed, and scrolls only its body with a slim scrollbar.
 * The page behind is scroll-locked while open.
 */
export function SidePanel({ open, onOpenChange, title, description, eyebrow, toolbar, footer, children, width = 'md' }: SidePanelProps) {
  return (
    <BodyPortal>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
          side="right"
          className={cx(
            '!inset-y-2 !right-2 !h-auto flex w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden rounded-[28px] border border-white/60 !bg-white p-0 !text-ink shadow-[0_32px_80px_-24px_rgba(0,0,0,0.45),0_0_0_1px_rgba(16,17,15,0.04)] sm:!inset-y-3 sm:!right-3',
            width === 'lg' ? 'sm:max-w-[30rem]' : 'sm:max-w-[26rem]'
          )}>
          
        <SheetHeader className="shrink-0 space-y-0 px-6 pb-4 pr-14 pt-6 text-left">
          {eyebrow && <div className="mb-3 flex flex-wrap items-center gap-2">{eyebrow}</div>}
          <SheetTitle className="font-display text-xl font-semibold leading-tight text-ink">{title}</SheetTitle>
          {description ? <SheetDescription className="mt-1 text-sm text-smoke">{description}</SheetDescription> : <SheetDescription className="sr-only">Panel</SheetDescription>}
        </SheetHeader>
        {toolbar && <div className="shrink-0 px-6 pb-3">{toolbar}</div>}
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-line">{children}</div>
        {footer && <div className="shrink-0 border-t border-line bg-white px-6 py-4">{footer}</div>}
      </SheetContent>
    </Sheet>
    </BodyPortal>);

}