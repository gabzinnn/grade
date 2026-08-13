import { CreditosAcumulados } from "@/lib/requisitos";

interface CreditBalanceChartProps {
  pontos: CreditosAcumulados[];
  metaTotal: number;
}

function pathFor(valores: number[], metaTotal: number): { area: string; linha: string } {
  const n = valores.length;
  const coords = valores.map((v, i) => {
    const x = n > 1 ? (i / (n - 1)) * 100 : 0;
    const y = 100 - Math.min(100, (v / metaTotal) * 100);
    return `${x},${y}`;
  });
  const linha = `M${coords.join(" L")}`;
  const area = `${linha} L100,100 L0,100 Z`;
  return { area, linha };
}

export function CreditBalanceChart({ pontos, metaTotal }: CreditBalanceChartProps) {
  const obrigatorias = pathFor(pontos.map((p) => p.obrigatoriasAcumuladas), metaTotal);
  const eletivas = pathFor(
    pontos.map((p) => p.obrigatoriasAcumuladas + p.eletivasAcumuladas),
    metaTotal,
  );
  const marcos = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(metaTotal * f));

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-chip bg-recess px-3 py-1 text-caps text-ink-2">
          <span className="h-2 w-2 rounded-full bg-cat-1" /> Obrigatórias
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-chip bg-recess px-3 py-1 text-caps text-ink-2">
          <span className="h-2 w-2 rounded-full bg-cat-3" /> Eletivas
        </span>
      </div>
      <div className="relative ml-10 h-[220px] border-b border-l border-hairline pt-2">
        <div className="absolute -left-10 top-0 flex h-full w-8 flex-col justify-between text-right font-data text-caps text-ink-3">
          {[...marcos].reverse().map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <path d={eletivas.area} fill="var(--color-cat-3)" opacity={0.15} />
          <path d={eletivas.linha} fill="none" stroke="var(--color-cat-3)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <path d={obrigatorias.area} fill="var(--color-cat-1)" opacity={0.2} />
          <path d={obrigatorias.linha} fill="none" stroke="var(--color-cat-1)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="ml-10 mt-1 flex justify-between font-data text-caps text-ink-3">
        {pontos.map((p) => (
          <span key={p.ordem}>{p.ordem}º</span>
        ))}
      </div>
    </div>
  );
}
