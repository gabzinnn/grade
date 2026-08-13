import { useQuery, useQueryClient, QueryKey } from "@tanstack/react-query";
import { buscarDetalheDisciplina } from "@/actions/detalheDisciplina";

export function disciplinaDetalheQueryKey(planoPeriodoId: number, disciplinaId: number): QueryKey {
  return ["disciplina-detalhe", planoPeriodoId, disciplinaId];
}

export function useDisciplinaDetalhe(planoPeriodoId: number, disciplinaId: number | null) {
  return useQuery({
    queryKey: disciplinaDetalheQueryKey(planoPeriodoId, disciplinaId ?? -1),
    queryFn: () => buscarDetalheDisciplina(disciplinaId!, planoPeriodoId),
    enabled: disciplinaId !== null,
  });
}

/** Usado nos gatilhos (hover/foco) pra deixar o dado pronto antes do clique. */
export function usePrefetchDisciplinaDetalhe() {
  const queryClient = useQueryClient();
  return (planoPeriodoId: number, disciplinaId: number) =>
    queryClient.prefetchQuery({
      queryKey: disciplinaDetalheQueryKey(planoPeriodoId, disciplinaId),
      queryFn: () => buscarDetalheDisciplina(disciplinaId, planoPeriodoId),
    });
}
