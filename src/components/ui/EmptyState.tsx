import React from "react";
import { cx } from "../../utils/styles";
import { BoxIcon } from "lucide-react";
interface EmptyStateProps {
  icon: BoxIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  className
}: EmptyStateProps) {
  return <div className={cx('flex flex-col items-center rounded-2xl border-2 border-dashed border-line bg-white/60 px-6 py-12 text-center', className)}>
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-lime">
        <Icon className="h-5 w-5 text-ink" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-smoke">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>;
}