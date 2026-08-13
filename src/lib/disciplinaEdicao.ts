import { db } from "@/lib/db";

export interface HorarioEditavel {
  diaSemana: number;
  inicioMin: number;
  fimMin: number;
}

export interface TurmaEditavel {
  codigo: string;
  nome: string;
  professor: string;
  horarios: HorarioEditavel[];
}

export interface DisciplinaEditavel {
  disciplinaId: number | null;
  codigo: string;
  nome: string;
  creditos: number;
  cargaHoraria: number;
  categoriaId: number | null;
  periodoSugerido: number | null;
  prereqIds: number[];
  turmas: TurmaEditavel[];
}

export interface OpcoesEdicaoDisciplina {
  categorias: { id: number; nome: string }[];
  disciplinasParaPrereq: { id: number; codigo: string; nome: string }[];
  versaoCurricularId: number;
  semestreAtualId: number | null;
}

export async function construirEdicaoDisciplina(
  disciplinaId: number | null,
  versaoCurricularId: number,
  semestreAtualId: number | null,
): Promise<{ disciplina: DisciplinaEditavel; opcoes: OpcoesEdicaoDisciplina }> {
  const [categorias, disciplinasVersao] = await Promise.all([
    db.categoria.findMany({ where: { versaoCurricularId }, orderBy: { ordem: "asc" }, select: { id: true, nome: true } }),
    db.disciplinaVersao.findMany({
      where: { versaoCurricularId },
      include: { disciplina: { select: { id: true, codigo: true, nome: true } } },
      orderBy: { disciplina: { codigo: "asc" } },
    }),
  ]);

  const disciplinasParaPrereq = disciplinasVersao
    .filter((dv) => dv.disciplinaId !== disciplinaId)
    .map((dv) => ({ id: dv.disciplina.id, codigo: dv.disciplina.codigo, nome: dv.disciplina.nome }));
  const opcoes: OpcoesEdicaoDisciplina = { categorias, disciplinasParaPrereq, versaoCurricularId, semestreAtualId };

  if (disciplinaId === null) {
    return {
      disciplina: {
        disciplinaId: null,
        codigo: "",
        nome: "",
        creditos: 2,
        cargaHoraria: 30,
        categoriaId: categorias[0]?.id ?? null,
        periodoSugerido: null,
        prereqIds: [],
        turmas: [],
      },
      opcoes,
    };
  }

  const [disciplina, discVersao, turmas] = await Promise.all([
    db.disciplina.findUniqueOrThrow({ where: { id: disciplinaId } }),
    db.disciplinaVersao.findUnique({
      where: { versaoCurricularId_disciplinaId: { versaoCurricularId, disciplinaId } },
      include: { requisitos: { where: { tipo: "PRE" } } },
    }),
    db.turma.findMany({
      where: { disciplinaId, semestreId: semestreAtualId ?? undefined },
      include: { horarios: true, professores: { include: { professor: true } } },
      orderBy: { codigo: "asc" },
    }),
  ]);

  return {
    disciplina: {
      disciplinaId,
      codigo: disciplina.codigo,
      nome: disciplina.nome,
      creditos: Number(disciplina.creditos),
      cargaHoraria: disciplina.cargaHoraria,
      categoriaId: discVersao?.categoriaId ?? categorias[0]?.id ?? null,
      periodoSugerido: discVersao?.periodoSugerido ?? null,
      prereqIds: discVersao?.requisitos.map((r) => r.disciplinaExigidaId) ?? [],
      turmas: turmas.map((t) => ({
        codigo: t.codigo,
        nome: t.nome ?? "",
        professor: t.professores[0]?.professor.nome ?? "",
        horarios: t.horarios.map((h) => ({ diaSemana: h.diaSemana, inicioMin: h.inicioMin, fimMin: h.fimMin })),
      })),
    },
    opcoes,
  };
}
