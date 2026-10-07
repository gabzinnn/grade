import { db } from "@/lib/db";
import { choque } from "@/lib/schedule";

export interface TurmaOpcao {
  id: number;
  codigo: string;
  professor: string | null;
  horarios: { diaSemana: number; inicioMin: number; fimMin: number; local: string | null }[];
  conflito: { comNome: string; comCodigo: string; dia: string } | null;
}

export interface PrereqNode {
  disciplinaId: number;
  codigo: string;
  nome: string;
  concluido: boolean;
}

export interface DestravaItem {
  disciplinaId: number;
  codigo: string;
  nome: string;
  categoriaNome: string;
  periodoSugerido: number | null;
}

export interface DetalheDisciplina {
  disciplinaId: number;
  planoPeriodoId: number;
  codigo: string;
  nome: string;
  creditos: number;
  cargaHoraria: number;
  turmas: TurmaOpcao[];
  turmaSelecionadaId: number | null;
  planoItemId: number | null;
  prerequisitos: PrereqNode[];
  destrava: DestravaItem[];
}

const DIA_NOME: Record<number, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
  7: "Domingo",
};

export async function construirDetalheDisciplina(
  disciplinaId: number,
  planoPeriodoId: number,
): Promise<DetalheDisciplina | null> {
  const periodo = await db.planoPeriodo.findUnique({
    where: { id: planoPeriodoId },
    include: {
      plano: { select: { donoId: true, versaoCurricularId: true } },
      itens: {
        where: { disciplinaId: { not: disciplinaId } },
        include: { disciplina: true, turma: { include: { horarios: true } } },
      },
    },
  });
  if (!periodo) return null;

  // Nem toda disciplina do plano está na versão curricular (ex.: ACE, disciplina
  // criada à mão sem categoria). Sem a versão a gente perde requisitos/destrava,
  // mas o resto do detalhe (turmas, matrícula) continua válido — devolver `null`
  // aqui virava spinner eterno no painel.
  const disciplinaVersao = await db.disciplinaVersao.findUnique({
    where: {
      versaoCurricularId_disciplinaId: { versaoCurricularId: periodo.plano.versaoCurricularId, disciplinaId },
    },
    include: { disciplina: true, requisitos: { include: { disciplinaExigida: true } } },
  });
  const disciplina = disciplinaVersao?.disciplina ?? (await db.disciplina.findUnique({ where: { id: disciplinaId } }));
  if (!disciplina) return null;

  // Período sem semestre não tem oferta pra mostrar. Antes isso virava
  // `semestreId: undefined`, que no Prisma quer dizer "sem filtro" — listava as
  // turmas de todos os semestres.
  const semestreId = periodo.semestreId;

  const [turmas, destravaVersoes, historico, itemExistente] = await Promise.all([
    semestreId === null
      ? []
      : db.turma.findMany({
          where: { disciplinaId, semestreId },
          include: { horarios: { include: { local: true } }, professores: { include: { professor: true } } },
          orderBy: { codigo: "asc" },
        }),
    db.disciplinaVersao.findMany({
      where: {
        versaoCurricularId: periodo.plano.versaoCurricularId,
        requisitos: { some: { disciplinaExigidaId: disciplinaId, tipo: "PRE" } },
      },
      include: { disciplina: true, categoria: true },
    }),
    db.historicoItem.findMany({ where: { perfilId: periodo.plano.donoId } }),
    db.planoItem.findUnique({ where: { planoPeriodoId_disciplinaId: { planoPeriodoId, disciplinaId } } }),
  ]);

  const concluidas = new Set(
    historico.filter((h) => h.status === "CONCLUIDA" || h.status === "DISPENSADA").map((h) => h.disciplinaId),
  );

  const intervalosOcupados = periodo.itens.flatMap((item) =>
    (item.turma?.horarios ?? []).map((h) => ({ ...h, disciplina: item.disciplina })),
  );

  const turmaOpcoes: TurmaOpcao[] = turmas.map((t) => {
    let conflito: TurmaOpcao["conflito"] = null;
    for (const h of t.horarios) {
      const ocupado = intervalosOcupados.find((o) => choque(h, o));
      if (ocupado) {
        conflito = { comNome: ocupado.disciplina.nome, comCodigo: ocupado.disciplina.codigo, dia: DIA_NOME[h.diaSemana] };
        break;
      }
    }
    return {
      id: t.id,
      codigo: t.codigo,
      professor: t.professores[0]?.professor.nome ?? null,
      horarios: t.horarios.map((h) => ({
        diaSemana: h.diaSemana,
        inicioMin: h.inicioMin,
        fimMin: h.fimMin,
        local: h.local ? `${h.local.predio} ${h.local.sala}` : null,
      })),
      conflito,
    };
  });

  const prerequisitos: PrereqNode[] = (disciplinaVersao?.requisitos ?? [])
    .filter((r) => r.tipo === "PRE")
    .map((r) => ({
      disciplinaId: r.disciplinaExigidaId,
      codigo: r.disciplinaExigida.codigo,
      nome: r.disciplinaExigida.nome,
      concluido: concluidas.has(r.disciplinaExigidaId),
    }));

  const destrava: DestravaItem[] = destravaVersoes.map((dv) => ({
    disciplinaId: dv.disciplinaId,
    codigo: dv.disciplina.codigo,
    nome: dv.disciplina.nome,
    categoriaNome: dv.categoria.nome,
    periodoSugerido: dv.periodoSugerido,
  }));

  return {
    disciplinaId,
    planoPeriodoId,
    codigo: disciplina.codigo,
    nome: disciplina.nome,
    creditos: Number(disciplina.creditos),
    cargaHoraria: disciplina.cargaHoraria,
    turmas: turmaOpcoes,
    // Item existente sem turma não herda a sugestão — senão a UI mostra "Sua turma" sem a grade refletir.
    turmaSelecionadaId: itemExistente ? itemExistente.turmaId : (turmaOpcoes.find((t) => !t.conflito)?.id ?? null),
    planoItemId: itemExistente?.id ?? null,
    prerequisitos,
    destrava,
  };
}
