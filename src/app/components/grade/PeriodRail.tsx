interface PeriodRailNode {
  ordem: number;
  creditos: number;
  tetoCreditos: number;
  atual: boolean;
}

interface PeriodRailProps {
  passado: { ateOrdem: number; creditos: number; disciplinas: number } | null;
  nos: PeriodRailNode[];
  formaturaLabel: string;
  limiteOrdem: number;
}

export function PeriodRail({ passado, nos, formaturaLabel, limiteOrdem }: PeriodRailProps) {
  return (
    <div className="relative flex h-20 w-full items-center">
      <div className="absolute left-0 right-0 top-1/2 z-0 h-px -translate-y-1/2 bg-hairline" />

      {passado && (
        <div className="relative z-10 mr-8 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-r-full border border-hairline bg-recess py-1.5 pl-4 pr-3">
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-data text-label text-ink">1º – {passado.ateOrdem}º</span>
            <span className="text-caps text-ink-2">
              {passado.creditos} créditos · {passado.disciplinas} disciplinas
            </span>
          </div>
        </div>
      )}

      {nos.map((no) => (
        <div key={no.ordem} className="relative z-10 mx-6 flex flex-col items-center">
          {no.atual && (
            <span className="absolute -top-6 whitespace-nowrap rounded-[4px] border border-primary/30 bg-canvas px-2 py-0.5 text-caps text-primary">
              Em curso
            </span>
          )}
          {no.atual ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-raised">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            </div>
          ) : (
            <div className="h-4 w-4 rounded-full border-[1.5px] border-dashed border-ink-3 bg-raised" />
          )}
          <span className="mt-2 font-data text-label text-ink">{no.ordem}º</span>
          <span className="mt-0.5 font-data text-caps text-ink-2 opacity-70">
            {no.creditos}/{no.tetoCreditos}
          </span>
        </div>
      ))}

      <div className="flex-1" />

      <div className="relative z-10 mx-6 flex flex-col items-center">
        <span className="text-label font-medium text-ink">Formatura</span>
        <span className="mt-0.5 font-data text-caps text-ink-2">{formaturaLabel}</span>
      </div>

      <div className="relative z-10 mr-4 flex flex-col items-center">
        <div className="h-2 w-px bg-ink-3 opacity-40" />
        <span className="mt-1 whitespace-nowrap font-data text-caps text-ink-3 opacity-70">
          limite de integralização · {limiteOrdem}º
        </span>
      </div>
    </div>
  );
}
