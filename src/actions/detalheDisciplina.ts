"use server";

import { construirDetalheDisciplina, DetalheDisciplina } from "@/lib/detalheDisciplina";

/** Wrapper fino: existe só pra dar ao React Query (client) um jeito de chamar
 * construirDetalheDisciplina (que usa Prisma, server-only) como queryFn. */
export async function buscarDetalheDisciplina(
  disciplinaId: number,
  planoPeriodoId: number,
): Promise<DetalheDisciplina | null> {
  return construirDetalheDisciplina(disciplinaId, planoPeriodoId);
}
