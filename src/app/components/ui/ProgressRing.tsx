interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
}

export function ProgressRing({ value, max, size = 64 }: ProgressRingProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const r = 15.9155;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="-rotate-90" width={size} height={size}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--color-recess)" strokeWidth="4" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="4"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-data text-label text-primary">
        {Math.round(pct)}%
      </span>
    </div>
  );
}
