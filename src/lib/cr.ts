export interface ItemCR {
  status: string;
  nota: number | null;
  creditos: number;
}

export interface AcumuladoCR {
  soma: number;
  creditos: number;
  cr: number | null;
}

/** Regra UFRJ: Σ(nota×créditos)/Σcréditos. Reprovadas entram; trancadas,
 * dispensadas e itens sem nota ficam de fora. */
export function acumularCR(itens: ItemCR[]): AcumuladoCR {
  let soma = 0;
  let creditos = 0;
  for (const i of itens) {
    if ((i.status !== "CONCLUIDA" && i.status !== "REPROVADA") || i.nota === null) continue;
    soma += i.nota * i.creditos;
    creditos += i.creditos;
  }
  return { soma, creditos, cr: creditos > 0 ? soma / creditos : null };
}

/** Média que falta tirar nos próximos `creditosFuturos` créditos pro CRA chegar em `alvo`. */
export function mediaNecessaria(atual: { soma: number; creditos: number }, alvo: number, creditosFuturos: number): number | null {
  if (creditosFuturos <= 0) return null;
  return (alvo * (atual.creditos + creditosFuturos) - atual.soma) / creditosFuturos;
}
