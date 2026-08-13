import { db } from "@/lib/db";
import { choque, turnoDe, Turno } from "@/lib/schedule";

export interface CatalogoTurma {
  id: number;
  codigo: string;
  professores: string[];
  horarios: { diaSemana: number; inicioMin: number; fimMin: number; local?: string }[];
  turnos: Turno[];
  conflito: boolean;
}

export interface CatalogoDisciplina {
  disciplinaId: number;
  codigo: string;
  nome: string;
  creditos: number;
  categoriaChave: string;
  categoriaNome: string;
  categoriaCor: string;
  periodoSugerido: number | null;
  turmas: CatalogoTurma[];
}

export async function construirCatalogo(perfilId: string) {
  const plano = await db.plano.findFirst({
    where: { principal: true, OR: [{ donoId: perfilId }, { acessos: { some: { perfilId } } }] },
    select: {
      id: true,
      nome: true,
      versaoCurricularId: true,
      dono: { select: { nome: true, apelido: true } },
      periodos: {
        where: { encerradoEm: null },
        orderBy: { ordem: "asc" },
        take: 1,
        select: {
          id: true,
          ordem: true,
          semestreId: true,
          itens: { select: { disciplinaId: true, turma: { select: { horarios: true } } } },
        },
      },
    },
  });
  if (!plano) return null;

  const periodoAtual = plano.periodos[0] ?? null;
  const semestreId = periodoAtual?.semestreId ?? -1; // -1: nenhuma turma bate, lista fica vazia

  const disciplinasVersao = await db.disciplinaVersao.findMany({
    where: { versaoCurricularId: plano.versaoCurricularId },
    include: {
      disciplina: {
        include: {
          turmas: {
            where: { semestreId },
            include: {
              horarios: { include: { local: true } },
              professores: { include: { professor: true } },
            },
          },
        },
      },
      categoria: true,
    },
    orderBy: [{ categoria: { ordem: "asc" } }, { disciplina: { codigo: "asc" } }],
  });

  const disciplinas: CatalogoDisciplina[] = disciplinasVersao.map((dv) => {
    const ocupadosOutros = (periodoAtual?.itens ?? [])
      .filter((i) => i.disciplinaId !== dv.disciplinaId)
      .flatMap((i) => i.turma?.horarios ?? []);

    const turmas: CatalogoTurma[] = dv.disciplina.turmas.map((t) => ({
      id: t.id,
      codigo: t.codigo,
      professores: t.professores.map((p) => p.professor.nome),
      horarios: t.horarios.map((h) => ({
        diaSemana: h.diaSemana,
        inicioMin: h.inicioMin,
        fimMin: h.fimMin,
        local: h.local ? `${h.local.predio} ${h.local.sala}` : undefined,
      })),
      turnos: [...new Set(t.horarios.map((h) => turnoDe(h.inicioMin)))],
      conflito: t.horarios.some((h) => ocupadosOutros.some((o) => choque(h, o))),
    }));

    return {
      disciplinaId: dv.disciplinaId,
      codigo: dv.disciplina.codigo,
      nome: dv.disciplina.nome,
      creditos: Number(dv.disciplina.creditos),
      categoriaChave: dv.categoria.chave,
      categoriaNome: dv.categoria.nome,
      categoriaCor: dv.categoria.corHex,
      periodoSugerido: dv.periodoSugerido,
      turmas,
    };
  });

  const categorias = [...new Map(disciplinas.map((d) => [d.categoriaChave, { chave: d.categoriaChave, nome: d.categoriaNome, cor: d.categoriaCor }])).values()];
  const professores = [...new Set(disciplinas.flatMap((d) => d.turmas.flatMap((t) => t.professores)))].sort();

  return {
    planoNome: plano.nome,
    usuarioNome: plano.dono.apelido ?? plano.dono.nome,
    periodoAtualId: periodoAtual?.id ?? null,
    periodoAtualOrdem: periodoAtual?.ordem ?? null,
    disciplinas,
    categorias,
    professores,
  };
}
