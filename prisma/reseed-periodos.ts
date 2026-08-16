// Reescreve só os PlanoItem/horários dos períodos 1–6 do plano principal da
// JuuJ, sem re-upsertar o catálogo inteiro (disciplinas/turmas/prereqs) —
// isso é o que faz `npm run seed` demorar tanto contra o Postgres remoto.
// Use pra iterar rápido em correções de período/horário; rode `npm run seed`
// completo se mexer em disciplinas novas, categorias ou currículo.
import { db } from "../src/lib/db";
import dados from "./dados-fonte.json";
import { PERFIL_A_ID, periodosAnteriores, escreverPeriodos } from "./seed";

async function main() {
  const plano = await db.plano.findFirstOrThrow({ where: { donoId: PERFIL_A_ID, principal: true } });

  const disciplinas = await db.disciplina.findMany({ select: { id: true, codigo: true } });
  const disciplinaIdPorCodigo = new Map(disciplinas.map((d) => [d.codigo, d.id]));

  const ANO_INGRESSO = 2024;
  const semestres = await db.semestre.findMany();
  const semestrePorOrdem = new Map<number, number>();
  for (let ordem = 1; ordem <= 10; ordem++) {
    const ano = ANO_INGRESSO + Math.floor((ordem - 1) / 2);
    const periodo = ((ordem - 1) % 2) + 1;
    const s = semestres.find((s) => s.ano === ano && s.periodo === periodo);
    if (s) semestrePorOrdem.set(ordem, s.id);
  }

  const planoPorPeriodo: Record<string, { cod: string }[]> = {
    ...periodosAnteriores,
    "6": dados.cursandoAtualmente_2026_2.map((cod) => ({ cod })),
  };

  await escreverPeriodos(plano.id, disciplinaIdPorCodigo, semestrePorOrdem, planoPorPeriodo);
  console.log("Períodos 1–6 reescritos.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
