interface RequisitoBarProps {
  label: string;
  obtidos: number;
  planejados: number;
  meta: number;
  cor: string;
  unidade?: string;
}

export function RequisitoBar({ label, obtidos, planejados, meta, cor, unidade = "cr" }: RequisitoBarProps) {
  const total = Math.max(meta, 1);
  const pctObtidos = Math.min(100, (obtidos / total) * 100);
  const pctPlanejados = Math.min(100 - pctObtidos, (planejados / total) * 100);

  return (
    <div className="flex h-11 items-center gap-4">
      <div className="w-36 shrink-0 text-caps uppercase text-ink-2">{label}</div>
      <div className="relative h-1.5 flex-1 rounded-chip bg-recess">
        <div className="absolute left-0 top-0 h-full rounded-chip" style={{ width: `${pctObtidos}%`, backgroundColor: cor }} />
        <div
          className="absolute top-0 h-full rounded-chip"
          style={{ left: `${pctObtidos}%`, width: `${pctPlanejados}%`, backgroundColor: `${cor}55` }}
        />
      </div>
      <div className="w-24 shrink-0 text-right font-data text-body-sm text-ink">
        <span className="font-medium">{obtidos}</span> / {meta} {unidade}
      </div>
    </div>
  );
}
