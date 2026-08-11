interface ProgressBarProps {
  value: number;
  max: number;
  colorClassName?: string;
  className?: string;
}

export function ProgressBar({ value, max, colorClassName = "bg-primary", className = "" }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={`h-2 rounded-chip bg-recess overflow-hidden ${className}`}>
      <div className={`h-full rounded-chip ${colorClassName}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
