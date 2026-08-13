"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePrefetchDisciplinaDetalhe } from "@/hooks/useDisciplinaDetalhe";
import { LinkPendingOverlay } from "@/app/components/ui/LinkPendingOverlay";

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
  const prefetch = usePrefetchDisciplinaDetalhe();

  return (
    <Link
      href={href}
      onMouseEnter={() => prefetch(planoPeriodoId, disciplinaId)}
      onFocus={() => prefetch(planoPeriodoId, disciplinaId)}
      className={`relative ${className}`}
    >
      {children}
      <LinkPendingOverlay />
    </Link>
  );
}
