import { db } from "../src/lib/db";
import { hashSync } from "bcryptjs";
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

export const PERFIL_A_ID = "00000000-0000-0000-0000-000000000001";
const PERFIL_B_ID = "00000000-0000-0000-0000-000000000002";

// ── períodos 1–5: reconstruídos a partir dos prints de grade reais
// (seed/*.jpeg) — a ordem real difere do "período sugerido" do BOA em
// alguns pontos (ex.: Física III/Cálculo Numérico/Física IV/Cálculo IV
// cursados mais tarde do que o currículo recomenda). Sem isso o Planejador
// não tinha PlanoPeriodo nenhum antes do 6º — só HistoricoItem solto, sem
// período — daí as abas de período anterior não apareciam.
export const periodosAnteriores: Record<string, { cod: string }[]> = {
  "1": ["EEH210", "EEI200", "FIS111", "FIT112", "ICP114", "IQG111", "MAC118"].map((cod) => ({ cod })),
  "2": ["EEG105", "EEI212", "FIS121", "FIT122", "ICP225", "IQG112", "MAC128"].map((cod) => ({ cod })),
  "3": ["EEA212", "EEG301", "EEI325", "MAC238", "MAE125", "EEI201", "EEI206"].map((cod) => ({ cod })),
  // ICP231 (Cálculo Numérico) reprovou no 4º e foi cursada de novo (aprovada) no 5º.
  "4": ["EEI426", "EET310", "FIM230", "FIN231", "EEI533", "EEI735", "ICP231", "NCG011"].map((cod) => ({ cod })),
  "5": ["FIM240", "ICP231", "MAC248", "EEA338", "EEI541", "EEI551", "EEI058", "EEI722"].map((cod) => ({ cod })),
};

// ── horários reais dos períodos 1, 3 e 5, tirados dos prints de grade
// (seed/*.jpeg) — sem print pros períodos 2 e 4, então essas matérias ficam
// sem horário mesmo (caem na lista "sem horário" do Planejador). Chave é
// "ordem:código" pq o ICP231 aparece em dois períodos (reprovou no 4º,
// refez no 5º) com horários diferentes — só o do 5º tem print.
export const horariosAnteriores: Record<string, { dia: string; ini: string; fim: string }[]> = {
  // 1º período — tabela oficial "Plano de Estudos 1"
  "1:FIS111": [{ dia: "SEG", ini: "10:00", fim: "12:00" }],
  "1:ICP114": [
    { dia: "SEG", ini: "13:00", fim: "15:00" },
    { dia: "SEX", ini: "10:00", fim: "12:00" },
  ],
  "1:MAC118": [
    { dia: "SEG", ini: "15:00", fim: "17:00" },
    { dia: "QUA", ini: "15:00", fim: "17:00" },
    { dia: "SEX", ini: "15:00", fim: "17:00" },
  ],
  "1:EEI200": [{ dia: "TER", ini: "13:00", fim: "15:00" }],
  "1:IQG111": [
    { dia: "TER", ini: "15:00", fim: "17:00" },
    { dia: "QUI", ini: "15:00", fim: "17:00" },
  ],
  "1:FIT112": [
    { dia: "QUA", ini: "13:00", fim: "15:00" },
    { dia: "SEX", ini: "13:00", fim: "15:00" },
  ],
  "1:EEH210": [{ dia: "QUI", ini: "17:00", fim: "19:00" }],
  // 3º período — print da grade
  "3:MAE125": [
    { dia: "TER", ini: "08:00", fim: "10:00" },
    { dia: "QUI", ini: "08:00", fim: "10:00" },
  ],
  "3:EEA212": [
    { dia: "SEG", ini: "10:00", fim: "12:00" },
    { dia: "QUA", ini: "10:00", fim: "12:00" },
  ],
  "3:EEI201": [
    { dia: "TER", ini: "10:00", fim: "12:00" },
    { dia: "QUI", ini: "10:00", fim: "12:00" },
  ],
  "3:EEI325": [
    { dia: "SEG", ini: "13:00", fim: "14:00" },
    { dia: "QUA", ini: "13:00", fim: "14:00" },
  ],
  "3:EEG301": [{ dia: "TER", ini: "13:00", fim: "14:00" }],
  "3:MAC238": [
    { dia: "TER", ini: "15:00", fim: "17:00" },
    { dia: "QUI", ini: "15:00", fim: "17:00" },
  ],
  "3:EEI206": [{ dia: "SEX", ini: "09:00", fim: "11:00" }],
  // 5º período — print da grade
  "5:EEI551": [{ dia: "SEG", ini: "08:00", fim: "10:00" }],
  "5:EEA338": [
    { dia: "QUA", ini: "08:00", fim: "10:00" },
    { dia: "SEX", ini: "08:00", fim: "10:00" },
  ],
  "5:EEI058": [{ dia: "QUI", ini: "08:00", fim: "10:00" }],
  "5:EEI541": [{ dia: "SEG", ini: "13:00", fim: "15:00" }],
  "5:EEI722": [{ dia: "TER", ini: "13:00", fim: "15:00" }],
  "5:FIM240": [
    { dia: "QUA", ini: "13:00", fim: "15:00" },
    { dia: "SEX", ini: "13:00", fim: "15:00" },
  ],
  "5:MAC248": [
    { dia: "QUA", ini: "15:00", fim: "17:00" },
    { dia: "SEX", ini: "15:00", fim: "17:00" },
  ],
  "5:ICP231": [
    { dia: "TER", ini: "10:00", fim: "12:00" },
    { dia: "QUI", ini: "10:00", fim: "12:00" },
  ],
};

export const ULTIMO_ORDEM_ENCERRADO = 5;

// ── escreve os PlanoItem de um conjunto de períodos pra um plano já
// existente. Extraído do corpo de seedPerfil pra dar pra rodar sozinho
// (ver prisma/reseed-periodos.ts) sem repetir o upsert pesado do catálogo
// inteiro — só isso aqui muda quando a gente corrige período/horário.
export async function escreverPeriodos(
  planoId: number,
  disciplinaIdPorCodigo: Map<string, number>,
  semestrePorOrdem: Map<number, number>,
  planoPorPeriodo: Record<string, { cod: string; turma?: string }[]>,
) {
  for (const [ordemStr, itens] of Object.entries(planoPorPeriodo)) {
    const ordem = Number(ordemStr);
    const semestreId = semestrePorOrdem.get(ordem);
    // um trigger de banco trava escrita em PlanoItem quando o período pai já
    // está encerrado — sempre grava os itens com o período aberto e só
    // encerra depois, senão nem o próprio reseed consegue rodar de novo.
    const periodo = await db.planoPeriodo.upsert({
      where: { planoId_ordem: { planoId, ordem } },
      update: { semestreId, encerradoEm: null },
      create: { planoId, ordem, semestreId },
    });

    // reseta os itens do período: upsert por si só nunca remove uma
    // matéria que saiu da lista (ex.: reclassificar Física III do 3º pro
    // 4º período deixava a matéria duplicada nos dois).
    await db.planoItem.deleteMany({ where: { planoPeriodoId: periodo.id } });

    for (const item of itens) {
      const disciplinaId = disciplinaIdPorCodigo.get(item.cod);
      if (!disciplinaId) continue;
      let turmaId: number | null = null;
      const horarios = horariosAnteriores[`${ordem}:${item.cod}`];
      if (horarios && semestreId) {
        // turma sintética só pra guardar o horário real (print de grade) de
        // um período já encerrado — não existe turma de verdade pra 2024/1.
        const turma = await db.turma.upsert({
          where: { disciplinaId_semestreId_codigo: { disciplinaId, semestreId, codigo: "HIST" } },
          update: {},
          create: { disciplinaId, semestreId, codigo: "HIST" },
        });
        // reseta os horários da turma: upsert por horário não some com um
        // slot que mudou de hora (a chave inclui o inicioMin, então trocar
        // 09h por 10h cria linha nova em vez de substituir a velha).
        await db.horarioTurma.deleteMany({ where: { turmaId: turma.id } });
        for (const h of horarios) {
          const diaSemana = DIA_MAP[h.dia];
          await db.horarioTurma.upsert({
            where: { turmaId_diaSemana_inicioMin: { turmaId: turma.id, diaSemana, inicioMin: minutos(h.ini) } },
            update: { fimMin: minutos(h.fim) },
            create: { turmaId: turma.id, diaSemana, inicioMin: minutos(h.ini), fimMin: minutos(h.fim) },
          });
        }
        turmaId = turma.id;
      } else if (item.turma) {
        const t = await db.turma.findFirst({ where: { disciplinaId, codigo: item.turma } });
        turmaId = t?.id ?? null;
      } else {
        // exclui turma "HIST" (a sintética de outro período já encerrado)
        // — senão uma matéria repetida (ex.: ICP231 reprovada no 4º) herda
        // por engano o horário da tentativa aprovada em outro período.
        const t = await db.turma.findFirst({ where: { disciplinaId, codigo: { not: "HIST" } } });
        turmaId = t?.id ?? null;
      }
      await db.planoItem.upsert({
        where: { planoPeriodoId_disciplinaId: { planoPeriodoId: periodo.id, disciplinaId } },
        update: { turmaId },
        create: { planoPeriodoId: periodo.id, disciplinaId, turmaId },
      });
    }

    // registro imutável (ver comentário no schema) — só cabe nos períodos
    // que já viraram histórico (1–5), nunca no atual/futuro.
    if (ordem <= ULTIMO_ORDEM_ENCERRADO) {
      await db.planoPeriodo.update({ where: { id: periodo.id }, data: { encerradoEm: new Date(2020, 0, 1) } });
    }
  }
}

const CATEGORIAS = [
  { chave: "OBRIGATORIA", nome: "Obrigatórias", corHex: "#2F6F8F", ordem: 1, ehEnfase: false, creditosExigidos: dados.metaCreditos.obrigatorias.total },
  { chave: "ENFASE_ECONOMICA", nome: "Ênfase em Engenharia Econômica", corHex: "#5B53A6", ordem: 2, ehEnfase: true, creditosExigidos: null },
  { chave: "ENFASE_GERENCIA", nome: "Ênfase em Gerência da Produção", corHex: "#9B3F73", ordem: 3, ehEnfase: true, creditosExigidos: null },
  { chave: "CONDICIONADA", nome: "Escolha Condicionada", corHex: "#2E8B6A", ordem: 4, ehEnfase: false, creditosExigidos: dados.metaCreditos.escolhaCondicionada.total },
  { chave: "HUMANAS", nome: "Grupo de Humanas", corHex: "#6E7B3F", ordem: 5, ehEnfase: false, creditosExigidos: dados.metaCreditos.grupoHumanas.total },
  // ponytail: ACE medido em carga horária, não em créditos — ver Categoria.cargaHorariaExigida
  { chave: "ACE", nome: "Atividades Curriculares de Extensão", corHex: "#7A7367", ordem: 6, ehEnfase: false, creditosExigidos: null, cargaHorariaExigida: dados.metaCreditos.grupoACE.totalCH },
  { chave: "LIVRE_ESCOLHA", nome: "Livre Escolha", corHex: "#8A6A3F", ordem: 7, ehEnfase: false, creditosExigidos: dados.metaCreditos.livreEscolha.total },
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
      // Atualiza de verdade: com `update: {}` uma seed antiga com metas erradas
      // ficava congelada no banco.
      update: {
        nome: cat.nome,
        corHex: cat.corHex,
        ordem: cat.ordem,
        ehEnfase: cat.ehEnfase,
        creditosExigidos: cat.creditosExigidos ?? null,
        cargaHorariaExigida: "cargaHorariaExigida" in cat ? cat.cargaHorariaExigida : null,
      },
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
  // ponytail: alguns códigos só aparecem como pré-requisito/equivalência, sem
  // nome nem créditos em lugar nenhum — placeholder explícito em vez de fingir
  // que o código é o nome. Nenhum deles conta crédito pra ninguém.
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

  // ── concluídas: dados reais do BOA (seed/boa.txt -> dados-fonte.json).
  // Sem `DisciplinaVersao` elas não têm categoria, e aí os créditos obtidos não
  // caem em barra nenhuma na Trilha/Início — era por isso que a home mostrava 0.
  for (const d of dados.concluidas) {
    const disciplina = await db.disciplina.upsert({
      where: { instituicaoId_codigo: { instituicaoId: instituicao.id, codigo: d.codigo } },
      update: { nome: d.nome, creditos: d.creditos, cargaHoraria: d.ch },
      create: {
        instituicaoId: instituicao.id,
        codigo: d.codigo,
        nome: d.nome,
        creditos: d.creditos,
        cargaHoraria: d.ch,
      },
    });
    disciplinaIdPorCodigo.set(d.codigo, disciplina.id);

    const categoriaId = categoriaPorChave.get(d.categoria);
    if (!categoriaId) throw new Error(`Categoria desconhecida em concluidas: ${d.categoria}`);
    await db.disciplinaVersao.upsert({
      where: { versaoCurricularId_disciplinaId: { versaoCurricularId: versao.id, disciplinaId: disciplina.id } },
      update: { categoriaId },
      create: { versaoCurricularId: versao.id, disciplinaId: disciplina.id, categoriaId },
    });
  }

  await getOrStubDisciplina("EEWZ56", "Atividade Curricular de Extensão", 0, dados.metaCreditos.grupoACE.totalCH);
  // ACE é medida em carga horária, não em créditos — mas sem DisciplinaVersao o
  // detalhe dela no Planejador fica sem categoria.
  await db.disciplinaVersao.upsert({
    where: {
      versaoCurricularId_disciplinaId: {
        versaoCurricularId: versao.id,
        disciplinaId: disciplinaIdPorCodigo.get("EEWZ56")!,
      },
    },
    update: { categoriaId: categoriaPorChave.get("ACE")! },
    create: {
      versaoCurricularId: versao.id,
      disciplinaId: disciplinaIdPorCodigo.get("EEWZ56")!,
      categoriaId: categoriaPorChave.get("ACE")!,
    },
  });

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

  // ── equivalências: uma cursada satisfaz o pré-requisito de outra. Sem isso o
  // lib/planejador.ts marca matéria como bloqueada mesmo com o requisito coberto.
  for (const eq of dados.equivalencias) {
    const cursadaId = await getOrStubDisciplina(eq.cursada);
    const satisfazId = await getOrStubDisciplina(eq.satisfaz);
    await db.equivalencia.upsert({
      where: { versaoCurricularId_cursadaId_satisfazId: { versaoCurricularId: versao.id, cursadaId, satisfazId } },
      update: {},
      create: { versaoCurricularId: versao.id, cursadaId, satisfazId },
    });
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
    ...periodosAnteriores,
    ...exportPlan.plan,
    "6": dados.cursandoAtualmente_2026_2.map((cod) => ({ cod })),
  };

  async function seedPerfil(id: string, nome: string, apelido: string, dre: string, comGrade: boolean) {
    const senhaBruta = process.env.SEED_SENHA_PADRAO ?? "grade2026";
    const senhaHash = hashSync(senhaBruta, 10);
    await db.perfil.upsert({
      where: { id },
      update: { nome, apelido, dre, senhaHash, versaoCurricularId: versao.id, semestreIngressoId: semestrePorOrdem.get(1) },
      create: {
        id,
        nome,
        apelido,
        dre,
        senhaHash,
        versaoCurricularId: versao.id,
        semestreIngressoId: semestrePorOrdem.get(1),
      },
    });

    // Sem as ênfases o lib/trilha.ts não acha a RegraEnfase e as duas barras de
    // ênfase saem com meta 0 — as regras (15 + 9) já existem, faltava o vínculo.
    const enfases = {
      enfasePrincipalId: categoriaPorChave.get("ENFASE_ECONOMICA")!,
      contraEnfaseId: categoriaPorChave.get("ENFASE_GERENCIA")!,
    };
    const plano = await db.plano.upsert({
      where: { donoId_nome: { donoId: id, nome: "Plano principal" } },
      update: enfases,
      create: {
        donoId: id,
        versaoCurricularId: versao.id,
        nome: "Plano principal",
        principal: true,
        ...enfases,
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

    // Histórico é reconstruído do zero: uma seed antiga pode ter gravado códigos
    // que o BOA não confirma como aprovados (ex.: EEK345, que está "Cursando").
    await db.historicoItem.deleteMany({ where: { perfilId: id, semestreId: null } });
    await db.historicoItem.createMany({
      data: dados.concluidas.map((d) => ({
        perfilId: id,
        disciplinaId: disciplinaIdPorCodigo.get(d.codigo)!,
        status: "CONCLUIDA" as const,
        semestreId: null,
        nota: d.grau,
      })),
    });

    await escreverPeriodos(plano.id, disciplinaIdPorCodigo, semestrePorOrdem, planoPorPeriodo);

    return plano;
  }

  const planoA = await seedPerfil(PERFIL_A_ID, dados._meta.aluno, "JuuJ", dados._meta.dre, true);

  // ponytail: só a JuuJ tem dado real por enquanto — Gabriel fica com o perfil
  // existente (não apagado) mas sem plano/histórico fabricado por cima. Tirar
  // esse guard quando o Gabriel também tiver uma grade real para popular.
  if (process.env.SEED_SOMENTE_JUUJ !== "1") {
    const planoB = await seedPerfil(PERFIL_B_ID, "Gabriel Pereira", "GB", "124026443", false);

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
  }

  console.log("Seed concluído.");
}

// só roda o seed completo quando o arquivo é executado direto — o
// reseed-periodos.ts importa as constantes/escreverPeriodos daqui sem
// disparar de novo o upsert pesado do catálogo inteiro.
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
}
