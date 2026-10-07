import { db } from "@/lib/db";
import { Intervalo, janelasEmComum } from "@/lib/schedule";

export interface BlocoPessoa extends Intervalo {
  titulo: string;
  /** Presentes só quando o bloco é aula — compromisso pessoal não tem disciplina. */
  disciplinaId?: number;
  codigo?: string;
}

export interface Pessoa {
  perfilId: string;
  nome: string;
  blocos: BlocoPessoa[];
}

export interface JanelaComum extends Intervalo {
  minutos: number;
}

const DIA_NOME: Record<number, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
};

async function carregarPessoa(donoId: string): Promise<Pessoa | null> {
  const perfil = await db.perfil.findUnique({
    where: { id: donoId },
    select: { id: true, nome: true, apelido: true },
  });
  if (!perfil) return null;

  const [periodoAtual, blocosPessoais] = await Promise.all([
    db.planoPeriodo.findFirst({
      where: { plano: { donoId, principal: true }, encerradoEm: null },
      orderBy: { ordem: "asc" },
      select: {
        semestreId: true,
        itens: {
          select: {
            disciplina: { select: { id: true, codigo: true, nome: true } },
            turma: { select: { horarios: { select: { diaSemana: true, inicioMin: true, fimMin: true } } } },
          },
        },
      },
    }),
    db.blocoIndisponibilidade.findMany({
      where: { perfilId: donoId },
      select: { titulo: true, diaSemana: true, inicioMin: true, fimMin: true, semestreId: true },
    }),
  ]);

  const blocosAulas: BlocoPessoa[] = (periodoAtual?.itens ?? []).flatMap((item) =>
    (item.turma?.horarios ?? []).map((h) => ({
      titulo: item.disciplina.nome,
      disciplinaId: item.disciplina.id,
      codigo: item.disciplina.codigo,
      diaSemana: h.diaSemana,
      inicioMin: h.inicioMin,
      fimMin: h.fimMin,
    })),
  );

  // mesma regra do planejador: bloco sem semestre vale sempre, com semestre só naquele período
  const blocosPessoaisFormatados: BlocoPessoa[] = blocosPessoais
    .filter((b) => b.semestreId === null || b.semestreId === periodoAtual?.semestreId)
    .map((b) => ({
      titulo: b.titulo,
      diaSemana: b.diaSemana,
      inicioMin: b.inicioMin,
      fimMin: b.fimMin,
    }));

  return {
    perfilId: perfil.id,
    nome: perfil.apelido ?? perfil.nome,
    blocos: [...blocosAulas, ...blocosPessoaisFormatados],
  };
}

export interface NossaSemana {
  eu: Pessoa;
  colega: Pessoa;
  janelasComuns: JanelaComum[];
  melhoresJanelas: JanelaComum[];
}

export async function construirNossaSemana(perfilId: string): Promise<NossaSemana | null> {
  const acesso = await db.planoAcesso.findFirst({
    where: { perfilId, plano: { donoId: { not: perfilId } } },
    select: { plano: { select: { donoId: true } } },
  });
  if (!acesso) return null; // ninguém compartilhou um plano com você ainda

  const [eu, colega] = await Promise.all([carregarPessoa(perfilId), carregarPessoa(acesso.plano.donoId)]);
  if (!eu || !colega) return null;

  const janelasComuns = janelasEmComum(eu.blocos, colega.blocos).map((j) => ({ ...j, minutos: j.fimMin - j.inicioMin }));
  const melhoresJanelas = janelasComuns
    .filter((j) => j.minutos >= 60)
    .sort((a, b) => b.minutos - a.minutos)
    .slice(0, 6);

  return { eu, colega, janelasComuns, melhoresJanelas };
}

export function nomeDoDia(diaSemana: number): string {
  return DIA_NOME[diaSemana] ?? "";
}
