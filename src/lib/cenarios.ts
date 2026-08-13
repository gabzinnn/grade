import { construirTrilha, TrilhaPlano, TrilhaHistorico } from "@/lib/trilha";

export function construirResumoCenario(plano: TrilhaPlano, historico: TrilhaHistorico) {
  const trilha = construirTrilha(plano, historico);
  const totalPlanejado = trilha.progresso.reduce((s, p) => s + p.planejados, 0);

  const periodosComItens = plano.periodos.filter((p) => p.itens.length > 0);
  const mediaCreditosPeriodo =
    periodosComItens.length > 0
      ? periodosComItens.reduce((s, p) => s + p.itens.reduce((s2, i) => s2 + Number(i.disciplina.creditos), 0), 0) /
        periodosComItens.length
      : 0;

  return {
    planoId: plano.id,
    nome: plano.nome,
    principal: plano.principal,
    totalPeriodos: plano.periodos.length,
    formaturaLabel: trilha.formaturaLabel,
    limiteOrdem: trilha.limiteOrdem,
    totalObtidos: trilha.totalObtidos,
    totalMeta: trilha.totalMeta,
    totalPlanejado,
    mediaCreditosPeriodo,
  };
}

export type ResumoCenario = ReturnType<typeof construirResumoCenario>;
