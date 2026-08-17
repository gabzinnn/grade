import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { Card } from "@/app/components/ui/Card";
import { ProgressRing } from "@/app/components/ui/ProgressRing";
import { SubmitButton } from "@/app/components/ui/SubmitButton";
import { PeriodRail } from "@/app/components/grade/PeriodRail";
import { PeriodLane } from "@/app/components/grade/PeriodLane";
import { CreditBalanceChart } from "@/app/components/grade/CreditBalanceChart";
import { db } from "@/lib/db";
import { getSessionPerfilId } from "@/lib/auth";
import { construirTrilha, trilhaPlanoInclude } from "@/lib/trilha";
import { adicionarPeriodo } from "@/actions/periodos";

export default async function TrilhaPage() {
  const perfilId = await getSessionPerfilId();

  // Prefere o plano principal do próprio perfil; só cai pro plano compartilhado
  // com ele se não tiver um — um OR simples deixava a ordem ao sabor do
  // banco e podia trazer o plano de outra pessoa primeiro.
  const plano =
    (await db.plano.findFirst({ where: { principal: true, donoId: perfilId }, include: trilhaPlanoInclude })) ??
    (await db.plano.findFirst({
      where: { principal: true, acessos: { some: { perfilId } } },
      include: trilhaPlanoInclude,
    }));
  if (!plano) notFound();

  const historico = await db.historicoItem.findMany({
    where: { perfilId: plano.donoId },
    include: { disciplina: true },
  });

  const trilha = construirTrilha(plano, historico);

  return (
    <AppShell
      title="Trilha"
      subtitulo={`Plano: ${plano.nome}`}
      planoNome={plano.nome}
      usuarioNome={plano.dono.apelido ?? plano.dono.nome}
    >
      <div className="flex flex-col gap-5">
        <Card className="overflow-x-auto">
          <div className="min-w-[640px]">
            <PeriodRail
              passado={trilha.passado}
              nos={trilha.nos}
              formaturaLabel={trilha.formaturaLabel}
              limiteOrdem={trilha.limiteOrdem}
            />
          </div>
        </Card>

        <div className="flex flex-col gap-5 lg:flex-row">
          <Card className="lg:w-[62%]">
            <h3 className="mb-4 text-body font-semibold text-ink">Balanço de créditos</h3>
            <CreditBalanceChart pontos={trilha.pontosChart} metaTotal={trilha.metaGrafico} />
          </Card>

          <div className="flex flex-col gap-5 lg:w-[38%]">
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-caps uppercase text-ink-2">Progresso total</p>
                <p className="text-title font-semibold text-ink">
                  {trilha.totalObtidos} / {trilha.totalMeta}
                </p>
                <p className="text-label text-ink-2">créditos concluídos</p>
              </div>
              <ProgressRing value={trilha.totalObtidos} max={trilha.totalMeta || 1} />
            </Card>

            <Card>
              <h3 className="mb-3 text-body font-semibold text-ink">Progresso por categoria</h3>
              <div className="flex flex-col gap-3">
                {trilha.progresso.map((p) => (
                  <div key={p.categoriaChave} className="flex items-center gap-3 text-label">
                    <span className="w-32 shrink-0 text-caps text-ink-2">{p.categoriaChave}</span>
                    <div className="h-1.5 flex-1 rounded-chip bg-recess">
                      <div
                        className="h-full rounded-chip bg-primary"
                        style={{ width: `${p.meta ? Math.min(100, (p.obtidos / p.meta) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right font-data text-ink">
                      {p.obtidos}/{p.meta ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-body font-semibold text-ink">Trilha de períodos</h3>
              <p className="text-label text-ink-2">Organização tátil da carga horária futura</p>
            </div>
            <form action={adicionarPeriodo}>
              <input type="hidden" name="planoId" value={plano.id} />
              <SubmitButton variant="secondary">+ Adicionar período</SubmitButton>
            </form>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {trilha.lanes.map((lane) => (
              <PeriodLane key={lane.id} {...lane} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
