"use server";

import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { getSessionPerfilId } from "@/lib/auth";
import { construirPlanejador, planejadorPlanoInclude, planejadorCacheTag, PlanejadorDados } from "@/lib/planejador";

/** Wrapper fino: dá ao React Query (client) um jeito de re-rodar a mesma busca
 * usada no primeiro paint do server component, pra reconciliar o cache depois
 * de uma mutação sem precisar de revalidatePath + router.refresh.
 *
 * O resultado fica no Data Cache do Next (a busca em si bate num Postgres
 * remoto — cada round trip custa rede de verdade), com uma entrada por
 * perfil. Mutações chamam `revalidateTag(planejadorCacheTag(perfilId))` pra
 * invalidar. ponytail: a tag usa o perfil de quem está pedindo, não o dono do
 * plano — cobre o caso comum (editando o próprio plano); um colaborador
 * editando o plano de outra pessoa só vê o reflexo depois do TTL de 60s.
 */
export async function buscarPlanejador(periodoOrdem?: number): Promise<PlanejadorDados> {
  const perfilId = await getSessionPerfilId();

  const dados = await unstable_cache(
    async (ordem?: number) => {
      // Prefere o plano principal do próprio perfil; só cai pro plano compartilhado
      // com ele se não tiver um — um OR simples deixava a ordem ao sabor do
      // banco e podia trazer o plano de outra pessoa primeiro.
      const plano =
        (await db.plano.findFirst({ where: { principal: true, donoId: perfilId }, include: planejadorPlanoInclude })) ??
        (await db.plano.findFirst({
          where: { principal: true, acessos: { some: { perfilId } } },
          include: planejadorPlanoInclude,
        }));
      if (!plano) return null;

      const [historico, blocos] = await Promise.all([
        db.historicoItem.findMany({ where: { perfilId: plano.donoId } }),
        db.blocoIndisponibilidade.findMany({
          where: { perfilId: plano.donoId },
          select: { id: true, titulo: true, tipo: true, diaSemana: true, inicioMin: true, fimMin: true, semestreId: true },
        }),
      ]);
      return construirPlanejador(plano, historico, ordem, blocos);
    },
    ["planejador", perfilId],
    { tags: [planejadorCacheTag(perfilId), "planejador"], revalidate: 60 },
  )(periodoOrdem);

  if (!dados) notFound();
  return dados;
}
