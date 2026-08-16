"use client";

import { CSSProperties, ReactNode } from "react";
import { useDisciplinaDetalheContext } from "@/app/components/grade/DisciplinaDetalheContext";
import { useHoverPrefetchDetalhe } from "@/hooks/useDisciplinaDetalhe";

interface DisciplinaBlockTriggerProps {
  disciplinaId: number;
  planoPeriodoId: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Abre o slide-over de detalhe sem navegar — o dado já foi pré-carregado no hover. */
export function DisciplinaBlockTrigger({ disciplinaId, planoPeriodoId, className = "", style, children }: DisciplinaBlockTriggerProps) {
  const { abrir } = useDisciplinaDetalheContext();
  const hover = useHoverPrefetchDetalhe(planoPeriodoId, disciplinaId);

  return (
    <button
      type="button"
      onClick={() => abrir({ disciplinaId, planoPeriodoId })}
      {...hover}
      className={`block w-full text-left ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}
