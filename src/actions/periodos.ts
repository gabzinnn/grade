"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertPodeEditar, getSessionPerfilId } from "@/lib/auth";
import { planejadorCacheTag } from "@/lib/planejador";

const AdicionarPeriodoSchema = z.object({ planoId: z.coerce.number().int() });

export async function adicionarPeriodo(formData: FormData): Promise<void> {
  const { planoId } = AdicionarPeriodoSchema.parse({ planoId: formData.get("planoId") });
  await assertPodeEditar(planoId);

  const ultimo = await db.planoPeriodo.findFirst({ where: { planoId }, orderBy: { ordem: "desc" } });
  const ordem = (ultimo?.ordem ?? 0) + 1;

  await db.planoPeriodo.create({ data: { planoId, ordem } });

  revalidatePath("/trilha");
}

const AtualizarTetoSchema = z.object({
  planoPeriodoId: z.number().int(),
  tetoCreditos: z.number().int().min(1).max(60).nullable(),
});

/** Override manual do teto de créditos do período — ex.: reduzir durante um
 * estágio, que come parte da carga horária semanal disponível pra aulas. */
export async function atualizarTetoCreditos(input: z.infer<typeof AtualizarTetoSchema>): Promise<void> {
  const dados = AtualizarTetoSchema.parse(input);

  const periodo = await db.planoPeriodo.findUniqueOrThrow({
    where: { id: dados.planoPeriodoId },
    select: { planoId: true },
  });
  await assertPodeEditar(periodo.planoId);

  await db.planoPeriodo.update({
    where: { id: dados.planoPeriodoId },
    data: { tetoCreditos: dados.tetoCreditos },
  });

  revalidatePath("/trilha");
  revalidatePath("/");
  revalidatePath("/planejador");
  updateTag(planejadorCacheTag(await getSessionPerfilId()));
}

const FecharPeriodoSchema = z.object({
  planoPeriodoId: z.number().int(),
  itens: z.array(
    z.object({
      disciplinaId: z.number().int(),
      status: z.enum(["CONCLUIDA", "REPROVADA", "TRANCADA"]),
      nota: z.number().min(0).max(10).nullable(),
    }),
  ),
});

/** Promove os itens do período pra histórico (imutável) e marca o período como encerrado.
 * A partir daí o trigger `periodo_encerrado_imutavel` (migration manual) bloqueia
 * qualquer edição de PlanoItem nesse período — por isso a decisão precisa ser
 * tomada aqui, de uma vez, antes de fechar. */
export async function fecharPeriodo(input: z.infer<typeof FecharPeriodoSchema>): Promise<void> {
  const dados = FecharPeriodoSchema.parse(input);

  const periodo = await db.planoPeriodo.findUniqueOrThrow({
    where: { id: dados.planoPeriodoId },
    select: { planoId: true, semestreId: true, encerradoEm: true, plano: { select: { donoId: true } } },
  });
  await assertPodeEditar(periodo.planoId);
  if (periodo.encerradoEm) throw new Error("Período já está encerrado");
  if (!periodo.semestreId) throw new Error("Período sem semestre atribuído não pode ser encerrado");

  await db.$transaction(async (tx) => {
    for (const item of dados.itens) {
      const existente = await tx.historicoItem.findFirst({
        where: { perfilId: periodo.plano.donoId, disciplinaId: item.disciplinaId, semestreId: periodo.semestreId },
      });
      if (existente) {
        await tx.historicoItem.update({ where: { id: existente.id }, data: { status: item.status, nota: item.nota } });
      } else {
        await tx.historicoItem.create({
          data: {
            perfilId: periodo.plano.donoId,
            disciplinaId: item.disciplinaId,
            semestreId: periodo.semestreId,
            status: item.status,
            nota: item.nota,
          },
        });
      }
    }

    await tx.planoPeriodo.update({ where: { id: dados.planoPeriodoId }, data: { encerradoEm: new Date() } });
  });

  revalidatePath("/trilha");
  revalidatePath("/planejador");
  updateTag(planejadorCacheTag(await getSessionPerfilId()));
}
