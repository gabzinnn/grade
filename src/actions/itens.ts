"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertPodeEditar, getSessionPerfilId } from "@/lib/auth";
import { planejadorCacheTag } from "@/lib/planejador";

async function matricular(planoPeriodoId: number, disciplinaId: number, turmaId: number | null): Promise<void> {
  const periodo = await db.planoPeriodo.findUniqueOrThrow({
    where: { id: planoPeriodoId },
    select: { planoId: true },
  });
  await assertPodeEditar(periodo.planoId);

  await db.planoItem.upsert({
    where: { planoPeriodoId_disciplinaId: { planoPeriodoId, disciplinaId } },
    update: { turmaId },
    create: { planoPeriodoId, disciplinaId, turmaId },
  });

  revalidatePath("/planejador");
  updateTag(planejadorCacheTag(await getSessionPerfilId()));
}

const AdicionarItemSchema = z.object({
  planoPeriodoId: z.coerce.number().int(),
  disciplinaId: z.coerce.number().int(),
});

/** Adição rápida pela lista de pendências: pega a primeira turma disponível. */
export async function adicionarItemAoPeriodo(formData: FormData): Promise<void> {
  const { planoPeriodoId, disciplinaId } = AdicionarItemSchema.parse({
    planoPeriodoId: formData.get("planoPeriodoId"),
    disciplinaId: formData.get("disciplinaId"),
  });

  const turma = await db.turma.findFirst({ where: { disciplinaId }, orderBy: { codigo: "asc" } });
  await matricular(planoPeriodoId, disciplinaId, turma?.id ?? null);
}

const MatricularSchema = z.object({
  planoPeriodoId: z.number().int(),
  disciplinaId: z.number().int(),
  turmaId: z.number().int().nullable(),
});

/** Escolha explícita de turma, feita no slide-over de Detalhe da disciplina. */
export async function matricularNaTurma(planoPeriodoId: number, disciplinaId: number, turmaId: number | null): Promise<void> {
  const dados = MatricularSchema.parse({ planoPeriodoId, disciplinaId, turmaId });
  await matricular(dados.planoPeriodoId, dados.disciplinaId, dados.turmaId);
}

const RemoverItemSchema = z.object({ planoItemId: z.number().int() });

export async function removerItem(planoItemId: number): Promise<void> {
  const dados = RemoverItemSchema.parse({ planoItemId });

  const item = await db.planoItem.findUniqueOrThrow({
    where: { id: dados.planoItemId },
    select: { planoPeriodo: { select: { planoId: true } } },
  });
  await assertPodeEditar(item.planoPeriodo.planoId);

  await db.planoItem.delete({ where: { id: dados.planoItemId } });

  revalidatePath("/planejador");
  revalidatePath("/trilha");
  updateTag(planejadorCacheTag(await getSessionPerfilId()));
}
