import { Prisma } from "@prisma/client";
import { creditosPorCategoria, progressaoCumulativa, CreditoItem } from "@/lib/requisitos";
import { corPorDisciplina } from "@/lib/cor";
import { EstadoPeriodo } from "@/app/components/grade/PeriodLane";

const APROVADOS: Array<"CONCLUIDA" | "DISPENSADA"> = ["CONCLUIDA", "DISPENSADA"];

export const trilhaPlanoInclude = {
  dono: { select: { nome: true, apelido: true } },
  versaoCurricular: {
    include: {
      categorias: true,
      disciplinas: { include: { categoria: true, requisitos: { include: { disciplinaExigida: true } } } },
      regrasEnfase: true,
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

export type TrilhaPlano = Prisma.PlanoGetPayload<{ include: typeof trilhaPlanoInclude }>;
export type TrilhaHistorico = Prisma.HistoricoItemGetPayload<{ include: { disciplina: true } }>[];

export function construirTrilha(plano: TrilhaPlano, historico: TrilhaHistorico) {
  const { enfasePrincipalId, contraEnfaseId, versaoCurricular } = plano;

  const categoriaPorDisciplina = new Map(versaoCurricular.disciplinas.map((dv) => [dv.disciplinaId, dv.categoria]));
  const historicoPorDisciplina = new Map(historico.map((h) => [h.disciplinaId, h]));

  // ponytail: categoria de ênfase não tem creditosExigidos fixo — vem de RegraEnfase
  // conforme o papel (PRINCIPAL/CONTRA) que o plano deu a ela.
  function metaDaCategoria(categoria: (typeof versaoCurricular.categorias)[number]): number {
    if (categoria.creditosExigidos !== null) return Number(categoria.creditosExigidos);
    const papel = categoria.id === enfasePrincipalId ? "PRINCIPAL" : categoria.id === contraEnfaseId ? "CONTRA" : null;
    if (!papel) return 0;
    const regra = versaoCurricular.regrasEnfase.find((r) => r.papel === papel);
    return regra ? Number(regra.creditosExigidos) : 0;
  }

  const metaPorChave = new Map(versaoCurricular.categorias.map((c) => [c.chave, metaDaCategoria(c)]));

  const creditoItens: CreditoItem[] = [
    ...historico
      .filter((h) => APROVADOS.includes(h.status as "CONCLUIDA" | "DISPENSADA"))
      .map((h) => ({
        categoriaChave: categoriaPorDisciplina.get(h.disciplinaId)?.chave ?? "?",
        creditos: Number(h.disciplina.creditos),
        origem: "historico" as const,
      })),
    ...plano.periodos.flatMap((p) =>
      p.itens.map((item) => ({
        categoriaChave: categoriaPorDisciplina.get(item.disciplinaId)?.chave ?? "?",
        creditos: Number(item.disciplina.creditos),
        origem: "plano" as const,
      })),
    ),
  ];
  const progresso = creditosPorCategoria(creditoItens, metaPorChave);
  const totalObtidos = progresso.reduce((s, p) => s + p.obtidos, 0);
  const totalMeta = progresso.reduce((s, p) => s + (p.meta ?? 0), 0);

  const primeiroOrdemAberto = plano.periodos.find((p) => p.encerradoEm === null)?.ordem ?? plano.periodos[0]?.ordem;

  const disciplinasAprovadas = historico.filter((h) => APROVADOS.includes(h.status as "CONCLUIDA" | "DISPENSADA"));
  const passado =
    primeiroOrdemAberto && primeiroOrdemAberto > 1
      ? {
          ateOrdem: primeiroOrdemAberto - 1,
          creditos: disciplinasAprovadas.reduce((s, h) => s + Number(h.disciplina.creditos), 0),
          disciplinas: disciplinasAprovadas.length,
        }
      : null;

  const nos = plano.periodos.map((p) => ({
    ordem: p.ordem,
    creditos: p.itens.reduce((s, i) => s + Number(i.disciplina.creditos), 0),
    tetoCreditos: p.tetoCreditos ?? versaoCurricular.tetoCreditosPadrao,
    atual: p.ordem === primeiroOrdemAberto,
  }));

  const ultimoPeriodo = plano.periodos[plano.periodos.length - 1];
  const formaturaLabel = ultimoPeriodo?.semestre ? `${ultimoPeriodo.semestre.ano}/${ultimoPeriodo.semestre.periodo}` : "—";

  // Um ponto por período (fechado ou não) — os itens do PlanoItem continuam
  // presentes depois do fechamento, então dá pra plotar a progressão real
  // em vez de resumir 1..ateOrdem num único ponto (que escondia 1º-4º do gráfico).
  const pontosChart = progressaoCumulativa(
    plano.periodos.map((p) => ({
      ordem: p.ordem,
      obrigatorias: p.itens
        .filter((i) => categoriaPorDisciplina.get(i.disciplinaId)?.chave === "OBRIGATORIA")
        .reduce((s, i) => s + Number(i.disciplina.creditos), 0),
      eletivas: p.itens
        .filter((i) => categoriaPorDisciplina.get(i.disciplinaId)?.chave !== "OBRIGATORIA")
        .reduce((s, i) => s + Number(i.disciplina.creditos), 0),
    })),
  );
  const metaGrafico = Math.max(totalMeta, ...pontosChart.map((p) => p.obrigatoriasAcumuladas + p.eletivasAcumuladas));

  const lanes = plano.periodos.map((p) => {
    const estado: EstadoPeriodo = p.encerradoEm ? "CONCLUIDO" : p.ordem === primeiroOrdemAberto ? "ATUAL" : "FUTURO";
    return {
      id: p.id,
      ordem: p.ordem,
      label: p.semestre ? `${p.semestre.ano}.${p.semestre.periodo}` : `${p.ordem}º período`,
      creditos: p.itens.reduce((s, i) => s + Number(i.disciplina.creditos), 0),
      tetoCreditos: p.tetoCreditos ?? versaoCurricular.tetoCreditosPadrao,
      estado,
      itens: p.itens.map((item) => {
        const hist = historicoPorDisciplina.get(item.disciplinaId);
        const local = item.turma?.horarios[0]?.local;
        return {
          disciplinaId: item.disciplinaId,
          codigo: item.disciplina.codigo,
          nome: item.disciplina.nome,
          corCategoria: categoriaPorDisciplina.get(item.disciplinaId)?.corHex ?? "#7A7367",
          corDisciplina: corPorDisciplina(String(item.disciplinaId)),
          sala: local ? `${local.predio} ${local.sala}` : undefined,
          nota: hist?.nota ? Number(hist.nota) : undefined,
          reprovada: hist?.status === "REPROVADA",
        };
      }),
    };
  });

  return {
    passado,
    nos,
    formaturaLabel,
    limiteOrdem: versaoCurricular.prazoMaximoPeriodos,
    progresso,
    totalObtidos,
    totalMeta,
    pontosChart,
    metaGrafico: metaGrafico || 1,
    lanes,
  };
}
