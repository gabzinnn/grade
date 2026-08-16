"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useHoverPrefetchDetalhe } from "@/hooks/useDisciplinaDetalhe";

interface DisciplinaPrefetchLinkProps {
  href: string;
  disciplinaId: number;
  planoPeriodoId: number;
  className?: string;
  children: ReactNode;
}

/** Link pra outra rota (ex.: Trilha -> Planejador) que já deixa o detalhe pré-carregado no hover. */
export function DisciplinaPrefetchLink({
  href,
  disciplinaId,
  planoPeriodoId,
  className = "",
  children,
}: DisciplinaPrefetchLinkProps) {
  const hover = useHoverPrefetchDetalhe(planoPeriodoId, disciplinaId);

  return (
    <Link
      href={href}
      {...hover}
      className={`relative ${className}`}
    >
      {children}
    </Link>
  );
}
