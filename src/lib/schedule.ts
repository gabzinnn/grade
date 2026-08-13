export interface Intervalo {
  diaSemana: number;
  inicioMin: number;
  fimMin: number;
}

/** Fronteiras que só se tocam (fim de um == início do outro) não são choque. */
export function choque(a: Intervalo, b: Intervalo): boolean {
  if (a.diaSemana !== b.diaSemana) return false;
  return a.inicioMin < b.fimMin && b.inicioMin < a.fimMin;
}

export function diasPresenciais(itens: Intervalo[]): number {
  return new Set(itens.map((i) => i.diaSemana)).size;
}

export function cargaPorDia(itens: Intervalo[]): Record<number, number> {
  const carga: Record<number, number> = {};
  for (const item of itens) {
    carga[item.diaSemana] = (carga[item.diaSemana] ?? 0) + (item.fimMin - item.inicioMin);
  }
  return carga;
}

export interface ItemComCreditos {
  creditos: number;
}

export function creditosDoPeriodo(itens: ItemComCreditos[]): number {
  return itens.reduce((s, i) => s + i.creditos, 0);
}

const JANELA_INICIO_MIN = 420; // 07:00
const JANELA_FIM_MIN = 1260; // 21:00
const DIAS_UTEIS = [1, 2, 3, 4, 5];

/** Complemento dos ocupados dentro de [07:00, 21:00], por dia útil. */
export function janelasLivres(ocupados: Intervalo[]): Intervalo[] {
  const porDia = new Map<number, Intervalo[]>();
  for (const o of ocupados) {
    if (!porDia.has(o.diaSemana)) porDia.set(o.diaSemana, []);
    porDia.get(o.diaSemana)!.push(o);
  }

  const livres: Intervalo[] = [];
  for (const dia of DIAS_UTEIS) {
    const doDia = (porDia.get(dia) ?? []).slice().sort((a, b) => a.inicioMin - b.inicioMin);
    let cursor = JANELA_INICIO_MIN;
    for (const intervalo of doDia) {
      if (intervalo.inicioMin > cursor) {
        livres.push({ diaSemana: dia, inicioMin: cursor, fimMin: Math.min(intervalo.inicioMin, JANELA_FIM_MIN) });
      }
      cursor = Math.max(cursor, intervalo.fimMin);
      if (cursor >= JANELA_FIM_MIN) break;
    }
    if (cursor < JANELA_FIM_MIN) livres.push({ diaSemana: dia, inicioMin: cursor, fimMin: JANELA_FIM_MIN });
  }
  return livres;
}

/** União dos ocupados das duas pessoas, depois complemento — janelas livres pras duas ao mesmo tempo. */
export function janelasEmComum(ocupadosA: Intervalo[], ocupadosB: Intervalo[]): Intervalo[] {
  return janelasLivres([...ocupadosA, ...ocupadosB]);
}

/** Agrupa itens que se sobrepõem no tempo em clusters e atribui cada um à primeira
 * coluna livre dentro do cluster — pra desenhar blocos de choque lado a lado em vez
 * de empilhados. `ncols` é o nº de colunas do cluster em que o item caiu. */
export function layoutColunas<T extends Intervalo>(itens: T[]): (T & { col: number; ncols: number })[] {
  const ordenados = itens.slice().sort((a, b) => a.inicioMin - b.inicioMin || a.fimMin - b.fimMin);
  const resultado: (T & { col: number; ncols: number })[] = [];

  let i = 0;
  while (i < ordenados.length) {
    let j = i;
    let maxFim = ordenados[i].fimMin;
    while (j + 1 < ordenados.length && ordenados[j + 1].inicioMin < maxFim) {
      j++;
      maxFim = Math.max(maxFim, ordenados[j].fimMin);
    }
    const cluster = ordenados.slice(i, j + 1);
    const colFimPorColuna: number[] = [];
    const comColuna = cluster.map((item) => {
      let col = colFimPorColuna.findIndex((fim) => fim <= item.inicioMin);
      if (col === -1) {
        col = colFimPorColuna.length;
        colFimPorColuna.push(item.fimMin);
      } else {
        colFimPorColuna[col] = item.fimMin;
      }
      return { item, col };
    });
    const ncols = colFimPorColuna.length;
    for (const { item, col } of comColuna) resultado.push({ ...item, col, ncols });
    i = j + 1;
  }

  return resultado;
}

export type Turno = "manha" | "tarde" | "noite";

export function turnoDe(inicioMin: number): Turno {
  if (inicioMin < 720) return "manha"; // < 12:00
  if (inicioMin < 1080) return "tarde"; // < 18:00
  return "noite";
}
