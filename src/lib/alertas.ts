import { Intervalo, choque } from "@/lib/schedule";

export interface ItemComHorario {
  nome: string;
  horarios: Intervalo[];
}

export interface AlertaChoque {
  tipo: "CHOQUE";
  disciplinaA: string;
  disciplinaB: string;
  dia: string;
}

const DIA_NOME: Record<number, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
  7: "Domingo",
};

/** Choques de horário dentro de uma mesma lista de itens (tipicamente um período). */
export function detectarChoques(itens: ItemComHorario[]): AlertaChoque[] {
  const alertas: AlertaChoque[] = [];
  for (let i = 0; i < itens.length; i++) {
    for (let j = i + 1; j < itens.length; j++) {
      for (const ha of itens[i].horarios) {
        for (const hb of itens[j].horarios) {
          if (choque(ha, hb)) {
            alertas.push({ tipo: "CHOQUE", disciplinaA: itens[i].nome, disciplinaB: itens[j].nome, dia: DIA_NOME[ha.diaSemana] });
          }
        }
      }
    }
  }
  return alertas;
}

export interface RequisitoComNome {
  disciplinaExigidaId: number;
  nome: string;
  tipo: "PRE" | "CO";
}

export interface ItemComRequisitos {
  nome: string;
  requisitos: RequisitoComNome[];
}

export interface AlertaPreRequisito {
  tipo: "PRE_REQUISITO";
  disciplina: string;
  requisitoFaltante: string;
}

/** Disciplinas planejadas cujo pré-requisito ainda não está garantido
 * (nem concluído, nem planejado em período anterior). */
export function detectarPreRequisitosPendentes(
  itens: ItemComRequisitos[],
  garantidos: Set<number>,
): AlertaPreRequisito[] {
  const alertas: AlertaPreRequisito[] = [];
  for (const item of itens) {
    for (const req of item.requisitos) {
      if (req.tipo === "PRE" && !garantidos.has(req.disciplinaExigidaId)) {
        alertas.push({ tipo: "PRE_REQUISITO", disciplina: item.nome, requisitoFaltante: req.nome });
      }
    }
  }
  return alertas;
}

export type Alerta = AlertaChoque | AlertaPreRequisito;
