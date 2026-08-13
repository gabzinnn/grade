import { construirTrilha, TrilhaPlano, TrilhaHistorico } from "@/lib/trilha";
import { detectarChoques, detectarPreRequisitosPendentes, Alerta } from "@/lib/alertas";

const APROVADOS: Array<"CONCLUIDA" | "DISPENSADA"> = ["CONCLUIDA", "DISPENSADA"];

export function construirInicio(plano: TrilhaPlano, historico: TrilhaHistorico) {
  const trilha = construirTrilha(plano, historico);

  const nomePorCategoria = new Map(plano.versaoCurricular.categorias.map((c) => [c.chave, { nome: c.nome, cor: c.corHex }]));
  const requisitosPorDisciplina = new Map(plano.versaoCurricular.disciplinas.map((dv) => [dv.disciplinaId, dv.requisitos]));

  const primeiroOrdemAberto = plano.periodos.find((p) => p.encerradoEm === null)?.ordem;

  // ── choques: só importa resolver os do período em curso
  const periodoAtual = plano.periodos.find((p) => p.ordem === primeiroOrdemAberto);
  const alertasChoque: Alerta[] = periodoAtual
    ? detectarChoques(
        periodoAtual.itens.map((item) => ({
          nome: item.disciplina.nome,
          horarios: item.turma?.horarios ?? [],
        })),
      )
    : [];

  // ── pré-requisito pendente: varre os períodos em ordem, acumulando o que já
  // está garantido (histórico aprovado + o que foi planejado em período anterior)
  const cursaveis = new Set(
    historico.filter((h) => APROVADOS.includes(h.status as "CONCLUIDA" | "DISPENSADA")).map((h) => h.disciplinaId),
  );
  for (const eq of plano.versaoCurricular.equivalencias) {
    if (cursaveis.has(eq.cursadaId)) cursaveis.add(eq.satisfazId);
  }
  const garantidos = new Set(cursaveis);
  const alertasPreRequisito: Alerta[] = [];
  for (const periodo of plano.periodos) {
    const itensComRequisitos = periodo.itens.map((item) => ({
      nome: item.disciplina.nome,
      requisitos: (requisitosPorDisciplina.get(item.disciplinaId) ?? []).map((r) => ({
        disciplinaExigidaId: r.disciplinaExigidaId,
        nome: r.disciplinaExigida.nome,
        tipo: r.tipo,
      })),
    }));
    alertasPreRequisito.push(...detectarPreRequisitosPendentes(itensComRequisitos, garantidos));
    for (const item of periodo.itens) garantidos.add(item.disciplinaId);
  }

  const alertas = [...alertasChoque, ...alertasPreRequisito];

  const barras = trilha.progresso.map((p) => ({
    categoriaChave: p.categoriaChave,
    nome: nomePorCategoria.get(p.categoriaChave)?.nome ?? p.categoriaChave,
    cor: nomePorCategoria.get(p.categoriaChave)?.cor ?? "#7A7367",
    obtidos: p.obtidos,
    planejados: p.planejados,
    meta: p.meta ?? 0,
  }));

  const totalPlanejado = trilha.progresso.reduce((s, p) => s + p.planejados, 0);
  const creditosRestantes = Math.max(0, trilha.totalMeta - trilha.totalObtidos - totalPlanejado);
  const periodosRestantes = primeiroOrdemAberto ? Math.max(1, trilha.limiteOrdem - primeiroOrdemAberto + 1) : 1;

  return {
    passado: trilha.passado,
    nos: trilha.nos,
    formaturaLabel: trilha.formaturaLabel,
    limiteOrdem: trilha.limiteOrdem,
    barras,
    alertas,
    creditosRestantes,
    periodosRestantes,
    mediaPorPeriodo: creditosRestantes / periodosRestantes,
  };
}
