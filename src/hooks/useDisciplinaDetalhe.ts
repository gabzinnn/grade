import { useEffect, useRef } from "react";
import { useQuery, useQueryClient, QueryKey } from "@tanstack/react-query";
import { buscarDetalheDisciplina } from "@/actions/detalheDisciplina";

/** Detalhe só muda quando o usuário mexe na grade — e aí a mutação invalida a
 * query na mão. Cache longo evita round-trip em reabertura. */
const DETALHE_STALE_MS = 5 * 60_000;

/** Hover precisa ser intencional: Server Actions do Next são serializadas por
 * cliente, então um prefetch por linha da lista de pendentes enfileira dezenas
 * de POSTs e a query do clique fica esperando atrás de todos eles. */
const INTENCAO_MS = 180;

export function disciplinaDetalheQueryKey(planoPeriodoId: number, disciplinaId: number): QueryKey {
  return ["disciplina-detalhe", planoPeriodoId, disciplinaId];
}

export function useDisciplinaDetalhe(planoPeriodoId: number, disciplinaId: number | null) {
  return useQuery({
    queryKey: disciplinaDetalheQueryKey(planoPeriodoId, disciplinaId ?? -1),
    queryFn: () => buscarDetalheDisciplina(disciplinaId!, planoPeriodoId),
    enabled: disciplinaId !== null,
    staleTime: DETALHE_STALE_MS,
  });
}

/** Handlers pros gatilhos (bloco da grade, linha da lista, link da Trilha):
 * deixa o detalhe pronto quando o mouse *para* em cima, não quando passa. */
export function useHoverPrefetchDetalhe(planoPeriodoId: number, disciplinaId: number) {
  const queryClient = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelar = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => cancelar, []);

  const prefetch = () =>
    queryClient.prefetchQuery({
      queryKey: disciplinaDetalheQueryKey(planoPeriodoId, disciplinaId),
      queryFn: () => buscarDetalheDisciplina(disciplinaId, planoPeriodoId),
      staleTime: DETALHE_STALE_MS,
    });

  return {
    onMouseEnter: () => {
      cancelar();
      timer.current = setTimeout(prefetch, INTENCAO_MS);
    },
    onMouseLeave: cancelar,
    // Foco é intenção explícita (teclado) — dispara na hora.
    onFocus: prefetch,
  };
}
