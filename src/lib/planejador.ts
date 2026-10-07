import { Prisma, HistoricoItem } from "@prisma/client";
import { choque, diasPresenciais, creditosDoPeriodo, turnoDe, Intervalo, Turno } from "@/lib/schedule";
import { prerequisitosCumpridos } from "@/lib/requisitos";
import { corPorDisciplina } from "@/lib/cor";
import { detectarChoques, detectarPreRequisitosPendentes, Alerta } from "@/lib/alertas";
import { construirEstagioTurnos, tetoComEstagio } from "@/lib/estagio";
import { WeekGridItem } from "@/app/components/grade/WeekGrid";
import { PendingItemData } from "@/app/components/grade/PendingSidebar";
import { EstadoPeriodo } from "@/app/components/grade/PeriodLane";

export const planejadorPlanoInclude = {
  dono: { select: { nome: true, apelido: true } },
  versaoCurricular: {
    include: {
      disciplinas: {
        include: {
          disciplina: { include: { turmas: { include: { horarios: true } } } },
          categoria: true,
          requisitos: { include: { disciplinaExigida: true } },
        },
      },
      equivalencias: true,
    },
  },
  periodos: {
    orderBy: { ordem: "asc" as const },
    include: {
      semestre: true,
      itens: {
        include: {
          disciplina: true,
          turma: { include: { horarios: { include: { local: true } } } },
        },
      },
    },
  },
} satisfies Prisma.PlanoInclude;

export type PlanejadorPlano = Prisma.PlanoGetPayload<{ include: typeof planejadorPlanoInclude }>;

export type PlanejadorDados = NonNullable<ReturnType<typeof construirPlanejador>>;

export function planejadorCacheTag(perfilId: string): string {
  return `planejador:${perfilId}`;
}

export interface PlanejadorBloco {
  id: number;
  titulo: string;
  tipo: string;
  diaSemana: number;
  inicioMin: number;
  fimMin: number;
  semestreId: number | null;
}

export function construirPlanejador(
  plano: PlanejadorPlano,
  historico: HistoricoItem[],
  ordemAlvo?: number,
  blocos: PlanejadorBloco[] = [],
) {
  const primeiroOrdemAberto = plano.periodos.find((p) => p.encerradoEm === null)?.ordem;
  const periodoAlvo =
    plano.periodos.find((p) => p.ordem === ordemAlvo) ??
    plano.periodos.find((p) => p.ordem === primeiroOrdemAberto) ??
    plano.periodos[0];
  if (!periodoAlvo) return null;

  const categoriaPorDisciplina = new Map(plano.versaoCurricular.disciplinas.map((dv) => [dv.disciplinaId, dv.categoria]));
  const requisitosPorDisciplina = new Map(plano.versaoCurricular.disciplinas.map((dv) => [dv.disciplinaId, dv.requisitos]));
  const historicoPorDisciplina = new Map(historico.map((h) => [h.disciplinaId, h]));

  const cursaveis = new Set(
    historico.filter((h) => h.status === "CONCLUIDA" || h.status === "DISPENSADA").map((h) => h.disciplinaId),
  );
  for (const eq of plano.versaoCurricular.equivalencias) {
    if (cursaveis.has(eq.cursadaId)) cursaveis.add(eq.satisfazId);
  }

  const idsNoPeriodoAlvo = new Set(periodoAlvo.itens.map((i) => i.disciplinaId));
  const idsJaEmCurso = new Set(
    historico.filter((h) => h.status !== "REPROVADA" && h.status !== "TRANCADA").map((h) => h.disciplinaId),
  );

  const pendencias: PendingItemData[] = plano.versaoCurricular.disciplinas
    .filter((dv) => !idsNoPeriodoAlvo.has(dv.disciplinaId) && !idsJaEmCurso.has(dv.disciplinaId))
    .map((dv) => {
      const turmaNoSemestre = dv.disciplina.turmas.find((t) => t.semestreId === periodoAlvo.semestreId);
      const turno: Turno | null = turmaNoSemestre?.horarios[0] ? turnoDe(turmaNoSemestre.horarios[0].inicioMin) : null;
      return {
        disciplinaId: dv.disciplinaId,
        codigo: dv.disciplina.codigo,
        nome: dv.disciplina.nome,
        creditos: Number(dv.disciplina.creditos),
        corDisciplina: corPorDisciplina(String(dv.disciplinaId)),
        categoriaChave: dv.categoria.chave,
        categoriaNome: dv.categoria.nome,
        categoriaCor: dv.categoria.corHex,
        bloqueada: !prerequisitosCumpridos(requisitosPorDisciplina.get(dv.disciplinaId) ?? [], cursaveis),
        reprovada: historicoPorDisciplina.get(dv.disciplinaId)?.status === "REPROVADA",
        turno,
      };
    });

  const estadoPeriodoAlvo: EstadoPeriodo = periodoAlvo.encerradoEm
    ? "CONCLUIDO"
    : periodoAlvo.ordem === primeiroOrdemAberto
      ? "ATUAL"
      : "FUTURO";

  const horariosComItem = periodoAlvo.itens.flatMap((item) =>
    (item.turma?.horarios ?? []).map((h) => ({ item, h })),
  );
  const intervalos: Intervalo[] = horariosComItem.map(({ h }) => h);

  const gridItens: WeekGridItem[] = horariosComItem.map(({ item, h }) => ({
    id: `${item.id}-${h.id}`,
    disciplinaId: item.disciplinaId,
    diaSemana: h.diaSemana,
    inicioMin: h.inicioMin,
    fimMin: h.fimMin,
    codigo: item.disciplina.codigo,
    nome: item.disciplina.nome,
    corCategoria: categoriaPorDisciplina.get(item.disciplinaId)?.corHex ?? "#7A7367",
    corDisciplina: corPorDisciplina(String(item.disciplinaId)),
    sala: h.local ? `${h.local.predio} ${h.local.sala}` : undefined,
    temChoque: intervalos.some((outro) => outro !== h && choque(h, outro)),
    estado: estadoPeriodoAlvo,
  }));

  const blocosDoPeriodo: WeekGridItem[] = blocos
    .filter((b) => b.semestreId === null || b.semestreId === periodoAlvo.semestreId)
    .map((b) => ({
      id: `bloco-${b.id}`,
      diaSemana: b.diaSemana,
      inicioMin: b.inicioMin,
      fimMin: b.fimMin,
      nome: b.titulo,
      corCategoria: "#7A7367",
      corDisciplina: "#7A7367",
      temChoque: false,
      estado: estadoPeriodoAlvo,
    }));
  gridItens.push(...blocosDoPeriodo);

  const semHorario = periodoAlvo.itens
    .filter((item) => !item.turma || item.turma.horarios.length === 0)
    .map((item) => ({
      disciplinaId: item.disciplinaId,
      codigo: item.disciplina.codigo,
      nome: item.disciplina.nome,
      creditos: Number(item.disciplina.creditos),
      corCategoria: categoriaPorDisciplina.get(item.disciplinaId)?.corHex ?? "#7A7367",
      corDisciplina: corPorDisciplina(String(item.disciplinaId)),
    }));

  // ── avisos do período alvo: garantidos acumulam histórico aprovado + itens dos
  // períodos anteriores (mesma regra de lib/inicio.ts), sem incluir o próprio alvo.
  const garantidos = new Set(cursaveis);
  for (const p of plano.periodos) {
    if (p.ordem >= periodoAlvo.ordem) break;
    for (const item of p.itens) garantidos.add(item.disciplinaId);
  }
  const itensComRequisitos = periodoAlvo.itens.map((item) => ({
    nome: item.disciplina.nome,
    requisitos: (requisitosPorDisciplina.get(item.disciplinaId) ?? []).map((r) => ({
      disciplinaExigidaId: r.disciplinaExigidaId,
      nome: r.disciplinaExigida.nome,
      tipo: r.tipo,
    })),
  }));
  const itensComHorario = periodoAlvo.itens.map((item) => ({
    nome: item.disciplina.nome,
    horarios: item.turma?.horarios ?? [],
  }));
  const avisos: Alerta[] = [
    ...detectarChoques(itensComHorario),
    ...detectarPreRequisitosPendentes(itensComRequisitos, garantidos),
  ];

  const periodos = plano.periodos.map((p) => ({
    ordem: p.ordem,
    encerrado: p.encerradoEm !== null,
    creditos: creditosDoPeriodo(p.itens.map((i) => ({ creditos: Number(i.disciplina.creditos) }))),
    tetoCreditos: tetoComEstagio(p.tetoCreditos ?? plano.versaoCurricular.tetoCreditosPadrao, blocos, p.semestreId),
    temChoque: detectarChoques(p.itens.map((i) => ({ nome: i.disciplina.nome, horarios: i.turma?.horarios ?? [] }))).length > 0,
    semestreLabel: p.semestre ? `${p.semestre.ano}/${p.semestre.periodo}` : undefined,
  }));

  const estagio = construirEstagioTurnos(itensComHorario);

  return {
    planoNome: plano.nome,
    donoNome: plano.dono.apelido ?? plano.dono.nome,
    periodoAlvo: {
      id: periodoAlvo.id,
      ordem: periodoAlvo.ordem,
      semestreLabel: periodoAlvo.semestre ? `${periodoAlvo.semestre.ano}/${periodoAlvo.semestre.periodo}` : undefined,
      estado: estadoPeriodoAlvo,
    },
    periodos,
    creditos: creditosDoPeriodo(periodoAlvo.itens.map((i) => ({ creditos: Number(i.disciplina.creditos) }))),
    dias: diasPresenciais(intervalos),
    gridItens,
    pendencias,
    semHorario,
    avisos,
    estagio,
  };
}
