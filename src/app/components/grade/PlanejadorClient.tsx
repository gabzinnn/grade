"use client";

import { useQuery } from "@tanstack/react-query";
import { WeekGrid } from "@/app/components/grade/WeekGrid";
import { PendingSidebar } from "@/app/components/grade/PendingSidebar";
import { DisciplinaDetalhePanel } from "@/app/components/grade/DisciplinaDetalhePanel";
import { DisciplinaDetalheProvider, DisciplinaAlvo } from "@/app/components/grade/DisciplinaDetalheContext";
import { PeriodoTabs } from "@/app/components/grade/PeriodoTabs";
import { AlertaList } from "@/app/components/grade/AlertaList";
import { SemHorarioList } from "@/app/components/grade/SemHorarioList";
import { EstagioTurnosCard } from "@/app/components/grade/EstagioTurnosCard";
import { buscarPlanejador } from "@/actions/planejador";
import { PlanejadorDados } from "@/lib/planejador";

export function planejadorQueryKey(periodoOrdem?: number) {
  return ["planejador", periodoOrdem ?? "atual"] as const;
}

interface PlanejadorClientProps {
  periodoOrdem?: number;
  initialData: PlanejadorDados;
  alvoInicial: DisciplinaAlvo | null;
}

export function PlanejadorClient({ periodoOrdem, initialData, alvoInicial }: PlanejadorClientProps) {
  // `initialData` seeda o cache com o que o server component já buscou —
  // primeiro paint não espera round-trip nenhum. Mutações subsequentes só
  // invalidam essa query (fetch em background, sem travar a tela como o
  // router.refresh() fazia).
  const { data: dados } = useQuery({
    queryKey: planejadorQueryKey(periodoOrdem),
    queryFn: () => buscarPlanejador(periodoOrdem),
    initialData,
  });

  return (
    <DisciplinaDetalheProvider inicial={alvoInicial}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="overflow-x-auto">
          <PeriodoTabs periodos={dados.periodos} ordemAtiva={dados.periodoAlvo.ordem} />
        </div>
        <div className="flex items-center gap-3 font-data text-label text-ink-2">
          <span>{dados.creditos} créditos</span>
          <span>·</span>
          <span>{dados.dias} dias na faculdade</span>
        </div>
      </div>

      {dados.avisos.length > 0 && (
        <div className="mb-5">
          <AlertaList alertas={dados.avisos} />
        </div>
      )}

      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-5">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <WeekGrid itens={dados.gridItens} planoPeriodoId={dados.periodoAlvo.id} />
            </div>
          </div>
          <SemHorarioList itens={dados.semHorario} planoPeriodoId={dados.periodoAlvo.id} />
          <EstagioTurnosCard estagio={dados.estagio} />
        </div>
        <div className="w-full shrink-0 lg:sticky lg:top-4 lg:h-[calc(100vh-100px)] lg:w-[320px]">
          {dados.periodoAlvo.estado === "CONCLUIDO" ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 rounded-card border border-hairline bg-surface p-6 text-center">
              <p className="text-body-sm font-medium text-ink">Período encerrado</p>
              <p className="text-label text-ink-2">Registro imutável — sem edição.</p>
            </div>
          ) : (
            <PendingSidebar planoPeriodoId={dados.periodoAlvo.id} itens={dados.pendencias} periodoOrdem={periodoOrdem} />
          )}
        </div>
      </div>

      <DisciplinaDetalhePanel periodoOrdem={periodoOrdem} />
    </DisciplinaDetalheProvider>
  );
}
