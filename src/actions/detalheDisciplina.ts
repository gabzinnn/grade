"use server";

import { db } from "@/lib/db";
import { assertPodeVer } from "@/lib/auth";
import { construirDetalheDisciplina, DetalheDisciplina } from "@/lib/detalheDisciplina";

/** Wrapper fino: existe só pra dar ao React Query (client) um jeito de chamar
 * construirDetalheDisciplina (que usa Prisma, server-only) como queryFn. */
export async function buscarDetalheDisciplina(
  disciplinaId: number,
  planoPeriodoId: number,
): Promise<DetalheDisciplina | null> {
  const periodo = await db.planoPeriodo.findUniqueOrThrow({
    where: { id: planoPeriodoId },
    select: { planoId: true },
  });
  await assertPodeVer(periodo.planoId);

  return construirDetalheDisciplina(disciplinaId, planoPeriodoId);
}
