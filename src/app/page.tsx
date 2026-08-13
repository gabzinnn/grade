import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { Card } from "@/app/components/ui/Card";
import { PeriodRail } from "@/app/components/grade/PeriodRail";
import { RequisitoBar } from "@/app/components/grade/RequisitoBar";
import { AlertaList } from "@/app/components/grade/AlertaList";
import { db } from "@/lib/db";
import { getSessionPerfilId } from "@/lib/auth";
import { trilhaPlanoInclude } from "@/lib/trilha";
import { construirInicio } from "@/lib/inicio";

export default async function InicioPage() {
  const perfilId = await getSessionPerfilId();

  const plano = await db.plano.findFirst({
    where: { principal: true, OR: [{ donoId: perfilId }, { acessos: { some: { perfilId } } }] },
    include: trilhaPlanoInclude,
  });
  if (!plano) notFound();

  const [historico, planosDoUsuario] = await Promise.all([
    db.historicoItem.findMany({ where: { perfilId: plano.donoId }, include: { disciplina: true } }),
    db.plano.findMany({
      where: { OR: [{ donoId: perfilId }, { acessos: { some: { perfilId } } }], arquivado: false },
      include: { periodos: { select: { _count: { select: { itens: true } } } } },
      orderBy: { principal: "desc" },
    }),
  ]);

  const inicio = construirInicio(plano, historico);
  const planosResumo = planosDoUsuario.map((p) => ({
    id: p.id,
    nome: p.nome,
    principal: p.principal,
    disciplinas: p.periodos.reduce((s, per) => s + per._count.itens, 0),
    periodos: p.periodos.length,
  }));

  return (
    <AppShell
      title="Início"
      subtitulo={`Bem-vindo(a) de volta, ${plano.dono.apelido ?? plano.dono.nome}`}
      planoNome={plano.nome}
      usuarioNome={plano.dono.apelido ?? plano.dono.nome}
    >
      <div className="flex flex-col gap-5">
        <Card className="overflow-x-auto">
          <div className="min-w-[640px]">
            <PeriodRail
              passado={inicio.passado}
              nos={inicio.nos}
              formaturaLabel={inicio.formaturaLabel}
              limiteOrdem={inicio.limiteOrdem}
            />
          </div>
        </Card>

        <div className="flex flex-col gap-5 lg:flex-row">
          <Card className="lg:w-[62%]">
            <h3 className="mb-5 flex items-center gap-2 text-body font-semibold text-ink">Requisitos para a formatura</h3>
            <div className="flex flex-col gap-4">
              {inicio.barras.map((b) => (
                <RequisitoBar
                  key={b.categoriaChave}
                  label={b.nome}
                  obtidos={b.obtidos}
                  planejados={b.planejados}
                  meta={b.meta}
                  cor={b.cor}
                />
              ))}
            </div>
            <p className="mt-6 border-t border-hairline pt-4 text-label text-ink-2">
              {inicio.creditosRestantes} créditos restantes em {inicio.periodosRestantes} períodos · média de{" "}
              {inicio.mediaPorPeriodo.toFixed(1)} por período
            </p>
          </Card>

          <div className="flex flex-col gap-5 lg:w-[38%]">
            <Card>
              <h3 className="mb-3 text-body font-semibold text-ink">Atenção</h3>
              <AlertaList alertas={inicio.alertas} />
            </Card>

            <Card>
              <h3 className="mb-3 text-body font-semibold text-ink">Meus planos</h3>
              <div className="flex flex-col gap-1">
                {planosResumo.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-block px-3 py-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-body-sm font-medium text-ink">{p.nome}</h4>
                      {p.principal && (
                        <span className="rounded-[4px] bg-recess px-1.5 py-0.5 text-caps uppercase text-ink-2">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-label text-ink-2">
                      {p.disciplinas} disciplinas · {p.periodos} períodos
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
