import { db } from "../src/lib/db";
import dados from "./dados-fonte.json";
import exportPlan from "../planejador-grade-export.json";

const DIA_MAP: Record<string, number> = {
  SEG: 1,
  TER: 2,
  QUA: 3,
  QUI: 4,
  SEX: 5,
  SAB: 6,
  DOM: 7,
};

function minutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

const PERFIL_A_ID = "00000000-0000-0000-0000-000000000001";
const PERFIL_B_ID = "00000000-0000-0000-0000-000000000002";

const CATEGORIAS = [
  { chave: "OBRIGATORIA", nome: "Obrigatórias", corHex: "#2F6F8F", ordem: 1, ehEnfase: false, creditosExigidos: dados.metaCreditos.obrigatorias.total },
  { chave: "ENFASE_ECONOMICA", nome: "Ênfase em Engenharia Econômica", corHex: "#5B53A6", ordem: 2, ehEnfase: true, creditosExigidos: null },
  { chave: "ENFASE_GERENCIA", nome: "Ênfase em Gerência da Produção", corHex: "#9B3F73", ordem: 3, ehEnfase: true, creditosExigidos: null },
  { chave: "CONDICIONADA", nome: "Escolha Condicionada", corHex: "#2E8B6A", ordem: 4, ehEnfase: false, creditosExigidos: dados.metaCreditos.escolhaCondicionada.total },
  { chave: "HUMANAS", nome: "Grupo de Humanas", corHex: "#6E7B3F", ordem: 5, ehEnfase: false, creditosExigidos: dados.metaCreditos.grupoHumanas.total },
  // ponytail: ACE medido em carga horária, não em créditos — ver Categoria.cargaHorariaExigida
  { chave: "ACE", nome: "Atividades Curriculares de Extensão", corHex: "#7A7367", ordem: 6, ehEnfase: false, creditosExigidos: null, cargaHorariaExigida: dados.metaCreditos.grupoACE.totalCH },
] as const;

async function main() {
  const instituicao = await db.instituicao.upsert({
    where: { sigla: "UFRJ" },
    update: {},
    create: { sigla: "UFRJ", nome: "Universidade Federal do Rio de Janeiro" },
  });

  const [cursoCodigo, ...cursoNomeParts] = dados._meta.curso.split(" - ");
  const curso = await db.curso.upsert({
    where: { instituicaoId_codigo: { instituicaoId: instituicao.id, codigo: cursoCodigo } },
    update: {},
    create: {
      instituicaoId: instituicao.id,
      codigo: cursoCodigo,
      nome: cursoNomeParts.join(" - ").replace(/\s*\(.*\)$/, ""),
    },
  });

  const versao = await db.versaoCurricular.upsert({
    where: { cursoId_codigo: { cursoId: curso.id, codigo: dados._meta.versaoCurricular } },
    update: {},
    create: {
      cursoId: curso.id,
      codigo: dados._meta.versaoCurricular,
      tetoCreditosPadrao: dados._meta.tetoCreditosPorPeriodo,
      prazoMaximoPeriodos: dados.metaCreditos ? 15 : 15,
    },
  });

  await db.regraEnfase.upsert({
    where: { versaoCurricularId_papel: { versaoCurricularId: versao.id, papel: "PRINCIPAL" } },
    update: {},
    create: { versaoCurricularId: versao.id, papel: "PRINCIPAL", creditosExigidos: 15 },
  });
  await db.regraEnfase.upsert({
    where: { versaoCurricularId_papel: { versaoCurricularId: versao.id, papel: "CONTRA" } },
    update: {},
    create: { versaoCurricularId: versao.id, papel: "CONTRA", creditosExigidos: 9 },
  });

  const categoriaPorChave = new Map<string, number>();
  for (const cat of CATEGORIAS) {
    const row = await db.categoria.upsert({
      where: { versaoCurricularId_chave: { versaoCurricularId: versao.id, chave: cat.chave } },
      update: {},
      create: {
        versaoCurricularId: versao.id,
        chave: cat.chave,
        nome: cat.nome,
        corHex: cat.corHex,
        ordem: cat.ordem,
        ehEnfase: cat.ehEnfase,
        creditosExigidos: cat.creditosExigidos ?? undefined,
        cargaHorariaExigida: "cargaHorariaExigida" in cat ? cat.cargaHorariaExigida : undefined,
      },
    });
    categoriaPorChave.set(cat.chave, row.id);
  }

  // ── semestres: ingresso (período 1) até o período final planejado (10)
  const ANO_INGRESSO = 2024;
  const semestrePorOrdem = new Map<number, number>();
  for (let ordem = 1; ordem <= 10; ordem++) {
    const ano = ANO_INGRESSO + Math.floor((ordem - 1) / 2);
    const periodo = ((ordem - 1) % 2) + 1;
    const semestre = await db.semestre.upsert({
      where: { ano_periodo: { ano, periodo } },
      update: {},
      create: { ano, periodo },
    });
    semestrePorOrdem.set(ordem, semestre.id);
  }
  const SEMESTRE_ATUAL_ORDEM = dados._meta.periodoAtual; // 6

  const disciplinaIdPorCodigo = new Map<string, number>();
  // ponytail: histórico não tem nome/créditos na fonte de dados — placeholder
  // explícito em vez de duplicar o código como se fosse nome. Corrigir via
  // dados-fonte.json + novo seed quando o nome real estiver disponível.
  async function getOrStubDisciplina(codigo: string, nome = "(nome não disponível)", creditos = 0, cargaHoraria = 0) {
    if (disciplinaIdPorCodigo.has(codigo)) return disciplinaIdPorCodigo.get(codigo)!;
    const row = await db.disciplina.upsert({
      where: { instituicaoId_codigo: { instituicaoId: instituicao.id, codigo } },
      update: {},
      create: { instituicaoId: instituicao.id, codigo, nome, creditos, cargaHoraria },
    });
    disciplinaIdPorCodigo.set(codigo, row.id);
    return row.id;
  }

  // ponytail: histórico só tem os códigos das disciplinas concluídas, sem nome/creditos —
  // criamos um registro mínimo; a disciplina real (se também estiver na grade futura) é
  // sobrescrita abaixo com os dados completos.
  for (const codigo of dados.concluidas) {
    await getOrStubDisciplina(codigo);
  }
  await getOrStubDisciplina("EEWZ56", "Atividade Curricular de Extensão", 0, dados.metaCreditos.grupoACE.totalCH);

  // ── catálogo completo (disciplinas da grade + turmas + horários + requisitos)
  for (const disc of dados.disciplinas) {
    const disciplina = await db.disciplina.upsert({
      where: { instituicaoId_codigo: { instituicaoId: instituicao.id, codigo: disc.codigo } },
      update: { nome: disc.nome, creditos: disc.creditos, cargaHoraria: disc.ch },
      create: {
        instituicaoId: instituicao.id,
        codigo: disc.codigo,
        nome: disc.nome,
        creditos: disc.creditos,
        cargaHoraria: disc.ch,
      },
    });
    disciplinaIdPorCodigo.set(disc.codigo, disciplina.id);

    const categoriaId = categoriaPorChave.get(disc.categoria);
    if (!categoriaId) throw new Error(`Categoria desconhecida: ${disc.categoria}`);

    const discVersao = await db.disciplinaVersao.upsert({
      where: { versaoCurricularId_disciplinaId: { versaoCurricularId: versao.id, disciplinaId: disciplina.id } },
      update: { categoriaId, periodoSugerido: disc.periodoGrade ?? null },
      create: {
        versaoCurricularId: versao.id,
        disciplinaId: disciplina.id,
        categoriaId,
        periodoSugerido: disc.periodoGrade ?? null,
      },
    });

    for (const codigoExigido of disc.prereq) {
      const disciplinaExigidaId = await getOrStubDisciplina(codigoExigido);
      await db.requisito.upsert({
        where: {
          disciplinaVersaoId_disciplinaExigidaId_tipo: {
            disciplinaVersaoId: discVersao.id,
            disciplinaExigidaId,
            tipo: "PRE",
          },
        },
        update: {},
        create: { disciplinaVersaoId: discVersao.id, disciplinaExigidaId, tipo: "PRE" },
      });
    }

    for (const t of disc.turmas) {
      const semestreAtualId = semestrePorOrdem.get(SEMESTRE_ATUAL_ORDEM)!;
      const turma = await db.turma.upsert({
        where: {
          disciplinaId_semestreId_codigo: {
            disciplinaId: disciplina.id,
            semestreId: semestreAtualId,
            codigo: t.turma,
          },
        },
        update: { nome: t.nome },
        create: {
          disciplinaId: disciplina.id,
          semestreId: semestreAtualId,
          codigo: t.turma,
          nome: t.nome,
        },
      });

      for (const h of t.horarios) {
        const diaSemana = DIA_MAP[h.dia];
        await db.horarioTurma.upsert({
          where: {
            turmaId_diaSemana_inicioMin: {
              turmaId: turma.id,
              diaSemana,
              inicioMin: minutos(h.ini),
            },
          },
          update: { fimMin: minutos(h.fim) },
          create: {
            turmaId: turma.id,
            diaSemana,
            inicioMin: minutos(h.ini),
            fimMin: minutos(h.fim),
          },
        });
      }
    }
  }

  // ── turmas ofertadas mas não necessárias — entram no catálogo sem DisciplinaVersao
  for (const t of dados.outrasTurmasOfertadas_naoNecessarias) {
    const disciplinaId = await getOrStubDisciplina(t.codigo, t.nome);
    const semestreAtualId = semestrePorOrdem.get(SEMESTRE_ATUAL_ORDEM)!;
    const turma = await db.turma.upsert({
      where: { disciplinaId_semestreId_codigo: { disciplinaId, semestreId: semestreAtualId, codigo: t.turma } },
      update: {},
      create: { disciplinaId, semestreId: semestreAtualId, codigo: t.turma },
    });
    for (const h of t.horarios) {
      const diaSemana = DIA_MAP[h.dia];
      await db.horarioTurma.upsert({
        where: { turmaId_diaSemana_inicioMin: { turmaId: turma.id, diaSemana, inicioMin: minutos(h.ini) } },
        update: { fimMin: minutos(h.fim) },
        create: { turmaId: turma.id, diaSemana, inicioMin: minutos(h.ini), fimMin: minutos(h.fim) },
      });
    }
  }

  // ── dois perfis de teste: histórico nos períodos 1–5, plano nos períodos 6–10
  const planoPorPeriodo: Record<string, { cod: string; turma?: string }[]> = {
    ...exportPlan.plan,
    "6": dados.cursandoAtualmente_2026_2.map((cod) => ({ cod })),
  };

  async function seedPerfil(id: string, nome: string, apelido: string, dre: string, comGrade: boolean) {
    await db.perfil.upsert({
      where: { id },
      update: { nome, apelido, dre, versaoCurricularId: versao.id, semestreIngressoId: semestrePorOrdem.get(1) },
      create: {
        id,
        nome,
        apelido,
        dre,
        versaoCurricularId: versao.id,
        semestreIngressoId: semestrePorOrdem.get(1),
      },
    });

    const plano = await db.plano.upsert({
      where: { donoId_nome: { donoId: id, nome: "Plano principal" } },
      update: {},
      create: {
        donoId: id,
        versaoCurricularId: versao.id,
        nome: "Plano principal",
        principal: true,
      },
    });

    // ponytail: só temos dado real de grade de uma pessoa — o segundo perfil
    // existe apenas para exercitar compartilhamento/Nossa semana, sem histórico
    // ou plano fabricados por cima do dele. Limpa o que uma seed antiga (antes
    // dessa flag existir) possa ter criado, já que upsert não some com o que
    // não é mais desejado.
    if (!comGrade) {
      await db.planoPeriodo.deleteMany({ where: { planoId: plano.id } });
      await db.historicoItem.deleteMany({ where: { perfilId: id } });
      return plano;
    }

    for (const codigo of dados.concluidas) {
      const disciplinaId = disciplinaIdPorCodigo.get(codigo)!;
      const existing = await db.historicoItem.findFirst({
        where: { perfilId: id, disciplinaId, semestreId: null },
      });
      if (!existing) {
        await db.historicoItem.create({
          data: { perfilId: id, disciplinaId, status: "CONCLUIDA", semestreId: null },
        });
      }
    }

    for (const [ordemStr, itens] of Object.entries(planoPorPeriodo)) {
      const ordem = Number(ordemStr);
      const semestreId = semestrePorOrdem.get(ordem);
      const periodo = await db.planoPeriodo.upsert({
        where: { planoId_ordem: { planoId: plano.id, ordem } },
        update: { semestreId },
        create: { planoId: plano.id, ordem, semestreId },
      });

      for (const item of itens) {
        const disciplinaId = disciplinaIdPorCodigo.get(item.cod);
        if (!disciplinaId) continue;
        let turmaId: number | null = null;
        if (item.turma) {
          const t = await db.turma.findFirst({ where: { disciplinaId, codigo: item.turma } });
          turmaId = t?.id ?? null;
        } else {
          const t = await db.turma.findFirst({ where: { disciplinaId } });
          turmaId = t?.id ?? null;
        }
        await db.planoItem.upsert({
          where: { planoPeriodoId_disciplinaId: { planoPeriodoId: periodo.id, disciplinaId } },
          update: { turmaId },
          create: { planoPeriodoId: periodo.id, disciplinaId, turmaId },
        });
      }
    }

    return plano;
  }

  const planoA = await seedPerfil(PERFIL_A_ID, dados._meta.aluno, "JuuJ", dados._meta.dre, true);
  const planoB = await seedPerfil(PERFIL_B_ID, "Ana Clara Silva", "Ana", "000000000", false);

  await db.planoAcesso.upsert({
    where: { planoId_perfilId: { planoId: planoA.id, perfilId: PERFIL_B_ID } },
    update: {},
    create: { planoId: planoA.id, perfilId: PERFIL_B_ID, papel: "LEITOR" },
  });
  await db.planoAcesso.upsert({
    where: { planoId_perfilId: { planoId: planoB.id, perfilId: PERFIL_A_ID } },
    update: {},
    create: { planoId: planoB.id, perfilId: PERFIL_A_ID, papel: "LEITOR" },
  });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
