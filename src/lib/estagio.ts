import { Intervalo } from "@/lib/schedule";

export interface ItemComHorarioNome {
  nome: string;
  horarios: Intervalo[];
}

export interface DiaEstagio {
  diaSemana: number;
  manhaLivre: boolean;
  tardeLivre: boolean;
  aproveitavel: boolean;
}

export interface MensagemEstagio {
  diaSemana: number;
  texto: string;
}

export interface EstagioTurnos {
  dias: DiaEstagio[];
  score: number;
  mensagens: MensagemEstagio[];
}

const DIAS = [1, 2, 3, 4, 5];
const DIA_NOME: Record<number, string> = { 1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta" };
const MANHA: [number, number] = [420, 780]; // 07:00–13:00
const TARDE: [number, number] = [780, 1140]; // 13:00–19:00

const overlaps = (aIni: number, aFim: number, bIni: number, bFim: number) => aIni < bFim && bIni < aFim;
const formatHora = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** Dias úteis com manhã (07–13h) OU tarde (13–19h) inteiramente livres — pré-requisito
 * prático pra estágio. Aponta o turno "mais barato" de liberar (menos matérias
 * ocupando, empate → tarde) quando o dia não é aproveitável. */
export function construirEstagioTurnos(itens: ItemComHorarioNome[]): EstagioTurnos {
  const porDia = new Map<number, { manha: { nome: string; horario: Intervalo }[]; tarde: { nome: string; horario: Intervalo }[] }>();
  for (const dia of DIAS) porDia.set(dia, { manha: [], tarde: [] });

  for (const item of itens) {
    for (const h of item.horarios) {
      const bucket = porDia.get(h.diaSemana);
      if (!bucket) continue;
      if (overlaps(h.inicioMin, h.fimMin, MANHA[0], MANHA[1])) bucket.manha.push({ nome: item.nome, horario: h });
      if (overlaps(h.inicioMin, h.fimMin, TARDE[0], TARDE[1])) bucket.tarde.push({ nome: item.nome, horario: h });
    }
  }

  let score = 0;
  const dias: DiaEstagio[] = [];
  const mensagens: MensagemEstagio[] = [];

  for (const dia of DIAS) {
    const { manha, tarde } = porDia.get(dia)!;
    const manhaLivre = manha.length === 0;
    const tardeLivre = tarde.length === 0;
    const aproveitavel = manhaLivre || tardeLivre;
    if (aproveitavel) score++;
    else {
      const alvoTarde = tarde.length <= manha.length;
      const culpados = alvoTarde ? tarde : manha;
      const unicos = [...new Map(culpados.map((c) => [c.nome, c])).values()];
      const lista = unicos.map((c) => `${c.nome} (${formatHora(c.horario.inicioMin)}–${formatHora(c.horario.fimMin)})`).join(" e ");
      mensagens.push({ diaSemana: dia, texto: `${DIA_NOME[dia]} perdeu a ${alvoTarde ? "tarde" : "manhã"} por causa de ${lista}` });
    }
    dias.push({ diaSemana: dia, manhaLivre, tardeLivre, aproveitavel });
  }

  return { dias, score, mensagens };
}

export interface BlocoHoras {
  tipo: string;
  semestreId: number | null;
  inicioMin: number;
  fimMin: number;
}

/** Regra UFRJ: com estágio, o período comporta no máximo 52 − (horas semanais de estágio) créditos.
 * Conta os blocos ESTAGIO que valem pra sempre ou especificamente nesse semestre. */
export function tetoComEstagio(teto: number, blocos: BlocoHoras[], semestreId: number | null): number {
  const minutos = blocos
    .filter((b) => b.tipo === "ESTAGIO" && (b.semestreId === null || b.semestreId === semestreId))
    .reduce((s, b) => s + (b.fimMin - b.inicioMin), 0);
  if (minutos === 0) return teto;
  return Math.max(0, Math.min(teto, Math.floor(52 - minutos / 60)));
}
