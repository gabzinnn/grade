import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { CenariosComparador } from "@/app/components/cenarios/CenariosComparador";
import { db } from "@/lib/db";
import { getSessionPerfilId } from "@/lib/auth";
import { trilhaPlanoInclude } from "@/lib/trilha";
import { construirResumoCenario } from "@/lib/cenarios";

interface CenariosPageProps {
  searchParams: Promise<{ b?: string }>;
}

export default async function CenariosPage({ searchParams }: CenariosPageProps) {
  const perfilId = await getSessionPerfilId();
  const { b } = await searchParams;

  const planos = await db.plano.findMany({
    where: { donoId: perfilId, arquivado: false },
    include: trilhaPlanoInclude,
    orderBy: [{ principal: "desc" }, { criadoEm: "asc" }],
  });
  if (planos.length === 0) notFound();

  const principal = planos.find((p) => p.principal) ?? planos[0];
  const cenarios = planos.filter((p) => p.id !== principal.id);
  const planoBId = b ? Number(b) : cenarios[0]?.id;
  const planoB = cenarios.find((p) => p.id === planoBId) ?? null;

  const historico = await db.historicoItem.findMany({
    where: { perfilId: principal.donoId },
    include: { disciplina: true },
  });

  const resumoA = construirResumoCenario(principal, historico);
  const resumoB = planoB ? construirResumoCenario(planoB, historico) : null;

  return (
    <AppShell
      title="Comparar cenários"
      subtitulo="Análise de impacto no seu plano de estudos"
      planoNome={principal.nome}
      usuarioNome={principal.dono.apelido ?? principal.dono.nome}
    >
      <CenariosComparador
        planoAId={principal.id}
        resumoA={resumoA}
        cenarios={cenarios.map((c) => ({ id: c.id, nome: c.nome }))}
        planoBSelecionadoId={planoB?.id ?? null}
        resumoB={resumoB}
      />
    </AppShell>
  );
}
