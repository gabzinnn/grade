"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertPodeEditar, getSessionPerfilId } from "@/lib/auth";
import { planejadorCacheTag } from "@/lib/planejador";

const CriarCenarioSchema = z.object({ planoBaseId: z.number().int(), nome: z.string().min(1).max(60) });

export async function criarCenario(input: z.infer<typeof CriarCenarioSchema>): Promise<void> {
  const dados = CriarCenarioSchema.parse(input);
  await assertPodeEditar(dados.planoBaseId);
  const perfilId = await getSessionPerfilId();

  const base = await db.plano.findUniqueOrThrow({
    where: { id: dados.planoBaseId },
    include: { periodos: { include: { itens: true } } },
  });

  await db.$transaction(async (tx) => {
    const novo = await tx.plano.create({
      data: {
        donoId: perfilId,
        versaoCurricularId: base.versaoCurricularId,
        nome: dados.nome,
        principal: false,
        enfasePrincipalId: base.enfasePrincipalId,
        contraEnfaseId: base.contraEnfaseId,
      },
    });

    for (const periodo of base.periodos) {
      const novoPeriodo = await tx.planoPeriodo.create({
        data: {
          planoId: novo.id,
          ordem: periodo.ordem,
          semestreId: periodo.semestreId,
          tetoCreditos: periodo.tetoCreditos,
          trancado: periodo.trancado,
          // ponytail: cenário nasce sempre aberto — não copia encerradoEm, senão o
          // trigger de imutabilidade de período fechado bloquearia edição no cenário novo.
        },
      });
      for (const item of periodo.itens) {
        await tx.planoItem.create({
          data: {
            planoPeriodoId: novoPeriodo.id,
            disciplinaId: item.disciplinaId,
            turmaId: item.turmaId,
            fixado: item.fixado,
            observacao: item.observacao,
          },
        });
      }
    }
  });

  revalidatePath("/cenarios");
}

const PlanoIdSchema = z.object({ planoId: z.number().int() });

export async function tornarPrincipal(planoId: number): Promise<void> {
  const dados = PlanoIdSchema.parse({ planoId });
  await assertPodeEditar(dados.planoId);

  const plano = await db.plano.findUniqueOrThrow({ where: { id: dados.planoId }, select: { donoId: true, principal: true } });
  if (plano.principal) return;

  await db.$transaction([
    db.plano.updateMany({ where: { donoId: plano.donoId, principal: true }, data: { principal: false } }),
    db.plano.update({ where: { id: dados.planoId }, data: { principal: true } }),
  ]);

  revalidatePath("/cenarios");
  revalidatePath("/");
  revalidatePath("/trilha");
  revalidatePath("/planejador");
  updateTag(planejadorCacheTag(plano.donoId));
}

export async function excluirCenario(planoId: number): Promise<void> {
  const dados = PlanoIdSchema.parse({ planoId });
  await assertPodeEditar(dados.planoId);

  const plano = await db.plano.findUniqueOrThrow({ where: { id: dados.planoId }, select: { principal: true } });
  if (plano.principal) throw new Error("Não é possível excluir o plano principal");

  await db.plano.delete({ where: { id: dados.planoId } });

  revalidatePath("/cenarios");
}
