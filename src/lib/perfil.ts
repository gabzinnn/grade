import { db } from "@/lib/db";

export async function construirPerfil(perfilId: string) {
  const perfil = await db.perfil.findUniqueOrThrow({
    where: { id: perfilId },
    include: {
      versaoCurricular: { include: { curso: true, categorias: { where: { ehEnfase: true }, orderBy: { ordem: "asc" } } } },
      preferencias: true,
      blocos: { include: { semestre: true }, orderBy: [{ diaSemana: "asc" }, { inicioMin: "asc" }] },
      planos: {
        where: { principal: true },
        include: {
          enfasePrincipal: true,
          periodos: { where: { semestreId: { not: null } }, orderBy: { ordem: "asc" }, include: { semestre: true } },
          contraEnfase: true,
          acessos: { include: { perfil: { select: { id: true, nome: true, apelido: true } } } },
        },
      },
    },
  });

  const plano = perfil.planos[0] ?? null;

  const outrosPerfis = await db.perfil.findMany({
    where: {
      id: {
        not: perfilId,
        ...(plano ? { notIn: plano.acessos.map((a) => a.perfilId) } : {}),
      },
    },
    select: { id: true, nome: true, apelido: true },
  });

  const semestres = (plano?.periodos ?? []).flatMap((p) =>
    p.semestre ? [{ id: p.semestre.id, label: `${p.semestre.ano}/${p.semestre.periodo}` }] : [],
  );

  return { perfil, plano, outrosPerfis, semestres };
}
