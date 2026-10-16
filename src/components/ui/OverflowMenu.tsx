import React, { useEffect, useId, useRef, useState } from "react";
import { MoreHorizontal, BoxIcon } from "lucide-react";
import { cx } from "../../utils/styles";
export interface OverflowMenuItem {
  label: string;
  icon?: BoxIcon;
  onSelect: () => void;
  disabled?: boolean;
}
interface OverflowMenuProps {
  label: string;
  items: OverflowMenuItem[];
  className?: string;
}

/** Compact “•••” menu. Closes on outside click, Escape, or selection. */
export function OverflowMenu({
  label,
  items,
  className
}: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const menuId = useId();
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return <div ref={wrap} className={cx('relative', className)}>
      <button type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((o) => !o)} className="grid h-8 w-8 place-items-center rounded-full text-smoke transition hover:bg-paper hover:text-ink">
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && <ul id={menuId} role="menu" className="absolute right-0 top-full z-30 mt-1.5 min-w-[13rem] overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(16,17,15,0.25)]">
          {items.map(({
        label: itemLabel,
        icon: Icon,
        onSelect,
        disabled
      }) => <li key={itemLabel} role="none">
              <button type="button" role="menuitem" disabled={disabled} onClick={() => {
          setOpen(false);
          onSelect();
        }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40">
                {Icon && <Icon className="h-4 w-4 text-smoke" aria-hidden="true" />}
                {itemLabel}
              </button>
            </li>)}
        </ul>}
    </div>;
}