"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { construirEdicaoDisciplina } from "@/lib/disciplinaEdicao";

export async function buscarEdicaoDisciplina(planoPeriodoId: number, disciplinaId: number | null) {
  const periodo = await db.planoPeriodo.findUniqueOrThrow({
    where: { id: planoPeriodoId },
    select: { semestreId: true, plano: { select: { versaoCurricularId: true } } },
  });
  return construirEdicaoDisciplina(disciplinaId, periodo.plano.versaoCurricularId, periodo.semestreId);
}

const HorarioSchema = z.object({
  diaSemana: z.number().int().min(1).max(7),
  inicioMin: z.number().int().min(0).max(1439),
  fimMin: z.number().int().min(0).max(1439),
});
const TurmaSchema = z.object({
  codigo: z.string().min(1).max(20),
  nome: z.string().max(120),
  professor: z.string().max(120),
  horarios: z.array(HorarioSchema),
});
const SalvarDisciplinaSchema = z.object({
  disciplinaId: z.number().int().nullable(),
  versaoCurricularId: z.number().int(),
  semestreAtualId: z.number().int().nullable(),
  codigo: z.string().min(1).max(20),
  nome: z.string().min(1).max(200),
  creditos: z.number().min(0).max(20),
  cargaHoraria: z.number().int().min(0),
  categoriaId: z.number().int().nullable(),
  periodoSugerido: z.number().int().min(1).max(20).nullable(),
  prereqIds: z.array(z.number().int()),
  turmas: z.array(TurmaSchema),
});

export async function salvarDisciplina(input: z.infer<typeof SalvarDisciplinaSchema>): Promise<void> {
  const dados = SalvarDisciplinaSchema.parse(input);

  await db.$transaction(async (tx) => {
    const versao = await tx.versaoCurricular.findUniqueOrThrow({
      where: { id: dados.versaoCurricularId },
      select: { curso: { select: { instituicaoId: true } } },
    });
    const instituicaoId = versao.curso.instituicaoId;

    const disciplina = await tx.disciplina.upsert({
      where: dados.disciplinaId
        ? { id: dados.disciplinaId }
        : { instituicaoId_codigo: { instituicaoId, codigo: dados.codigo } },
      update: { codigo: dados.codigo, nome: dados.nome, creditos: dados.creditos, cargaHoraria: dados.cargaHoraria },
      create: { instituicaoId, codigo: dados.codigo, nome: dados.nome, creditos: dados.creditos, cargaHoraria: dados.cargaHoraria },
    });

    if (dados.categoriaId) {
      const discVersao = await tx.disciplinaVersao.upsert({
        where: { versaoCurricularId_disciplinaId: { versaoCurricularId: dados.versaoCurricularId, disciplinaId: disciplina.id } },
        update: { categoriaId: dados.categoriaId, periodoSugerido: dados.periodoSugerido },
        create: {
          versaoCurricularId: dados.versaoCurricularId,
          disciplinaId: disciplina.id,
          categoriaId: dados.categoriaId,
          periodoSugerido: dados.periodoSugerido,
        },
      });

      const requisitosAtuais = await tx.requisito.findMany({ where: { disciplinaVersaoId: discVersao.id, tipo: "PRE" } });
      const idsAtuais = new Set(requisitosAtuais.map((r) => r.disciplinaExigidaId));
      const idsNovos = new Set(dados.prereqIds);
      for (const id of dados.prereqIds) {
        if (!idsAtuais.has(id)) {
          await tx.requisito.create({ data: { disciplinaVersaoId: discVersao.id, disciplinaExigidaId: id, tipo: "PRE" } });
        }
      }
      for (const r of requisitosAtuais) {
        if (!idsNovos.has(r.disciplinaExigidaId)) await tx.requisito.delete({ where: { id: r.id } });
      }
    }

    if (dados.semestreAtualId) {
      const turmasAtuais = await tx.turma.findMany({ where: { disciplinaId: disciplina.id, semestreId: dados.semestreAtualId } });
      const codigosNovos = new Set(dados.turmas.map((t) => t.codigo));
      for (const t of turmasAtuais) {
        if (!codigosNovos.has(t.codigo)) await tx.turma.delete({ where: { id: t.id } });
      }

      let primeiraTurmaId: number | null = null;
      for (const t of dados.turmas) {
        const turma = await tx.turma.upsert({
          where: { disciplinaId_semestreId_codigo: { disciplinaId: disciplina.id, semestreId: dados.semestreAtualId, codigo: t.codigo } },
          update: { nome: t.nome || null },
          create: { disciplinaId: disciplina.id, semestreId: dados.semestreAtualId, codigo: t.codigo, nome: t.nome || null },
        });
        primeiraTurmaId ??= turma.id;

        const horariosAtuais = await tx.horarioTurma.findMany({ where: { turmaId: turma.id } });
        const chaveNova = new Set(t.horarios.map((h) => `${h.diaSemana}-${h.inicioMin}`));
        for (const h of horariosAtuais) {
          if (!chaveNova.has(`${h.diaSemana}-${h.inicioMin}`)) await tx.horarioTurma.delete({ where: { id: h.id } });
        }
        for (const h of t.horarios) {
          await tx.horarioTurma.upsert({
            where: { turmaId_diaSemana_inicioMin: { turmaId: turma.id, diaSemana: h.diaSemana, inicioMin: h.inicioMin } },
            update: { fimMin: h.fimMin },
            create: { turmaId: turma.id, diaSemana: h.diaSemana, inicioMin: h.inicioMin, fimMin: h.fimMin },
          });
        }

        if (t.professor.trim()) {
          const professor = await tx.professor.upsert({
            where: { instituicaoId_nome: { instituicaoId, nome: t.professor.trim() } },
            update: {},
            create: { instituicaoId, nome: t.professor.trim() },
          });
          await tx.turmaProfessor.deleteMany({ where: { turmaId: turma.id, professorId: { not: professor.id } } });
          await tx.turmaProfessor.upsert({
            where: { turmaId_professorId: { turmaId: turma.id, professorId: professor.id } },
            update: {},
            create: { turmaId: turma.id, professorId: professor.id },
          });
        } else {
          await tx.turmaProfessor.deleteMany({ where: { turmaId: turma.id } });
        }
      }

      // Itens matriculados antes da turma existir (ou cuja turma foi apagada) ficam com
      // turmaId null e nunca entram na grade. ponytail: liga à 1ª turma; a escolha fina é no detalhe.
      if (primeiraTurmaId) {
        await tx.planoItem.updateMany({
          where: { disciplinaId: disciplina.id, turmaId: null, planoPeriodo: { semestreId: dados.semestreAtualId } },
          data: { turmaId: primeiraTurmaId },
        });
      }
    }
  });

  revalidatePath("/planejador");
  revalidatePath("/catalogo");
  revalidatePath("/trilha");
  updateTag("planejador");
}

export async function excluirDisciplina(disciplinaId: number): Promise<void> {
  await db.disciplina.delete({ where: { id: disciplinaId } });
  revalidatePath("/planejador");
  revalidatePath("/catalogo");
  revalidatePath("/trilha");
  updateTag("planejador");
}
