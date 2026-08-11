import { HTMLAttributes } from "react";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
}

export function Chip({ active = false, className = "", ...props }: ChipProps) {
  const tone = active ? "bg-primary text-raised" : "bg-recess text-ink-2";
  return (
    <span
      className={`inline-flex items-center h-7 px-3 rounded-chip text-caps uppercase tracking-[0.06em] ${tone} ${className}`}
      {...props}
    />
  );
}
