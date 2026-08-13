export type OrigemCreditos = "historico" | "plano";

export interface CreditoItem {
  categoriaChave: string;
  creditos: number;
  origem: OrigemCreditos;
}

export interface ProgressoCategoria {
  categoriaChave: string;
  obtidos: number;
  planejados: number;
  meta: number | null;
}

/** Soma créditos obtidos (histórico) e planejados (plano futuro) por categoria. */
export function creditosPorCategoria(
  itens: CreditoItem[],
  metas: Map<string, number | null>,
): ProgressoCategoria[] {
  const acc = new Map<string, { obtidos: number; planejados: number }>();
  for (const item of itens) {
    const entry = acc.get(item.categoriaChave) ?? { obtidos: 0, planejados: 0 };
    if (item.origem === "historico") entry.obtidos += item.creditos;
    else entry.planejados += item.creditos;
    acc.set(item.categoriaChave, entry);
  }
  return [...acc.entries()].map(([categoriaChave, v]) => ({
    categoriaChave,
    ...v,
    meta: metas.get(categoriaChave) ?? null,
  }));
}

export interface CreditosPeriodo {
  ordem: number;
  obrigatorias: number;
  eletivas: number;
}

export interface CreditosAcumulados {
  ordem: number;
  obrigatoriasAcumuladas: number;
  eletivasAcumuladas: number;
}

/** Acúmulo progressivo de créditos por período, para o gráfico de balanço. */
export function progressaoCumulativa(porPeriodo: CreditosPeriodo[]): CreditosAcumulados[] {
  let obrigatorias = 0;
  let eletivas = 0;
  return porPeriodo.map((p) => {
    obrigatorias += p.obrigatorias;
    eletivas += p.eletivas;
    return { ordem: p.ordem, obrigatoriasAcumuladas: obrigatorias, eletivasAcumuladas: eletivas };
  });
}

export interface RequisitoRef {
  disciplinaExigidaId: number;
  tipo: "PRE" | "CO";
}

/** Só os PRE bloqueiam matrícula — CO pode ser cursado junto. */
export function prerequisitosCumpridos(requisitos: RequisitoRef[], disciplinasCursaveis: Set<number>): boolean {
  return requisitos.filter((r) => r.tipo === "PRE").every((r) => disciplinasCursaveis.has(r.disciplinaExigidaId));
}
