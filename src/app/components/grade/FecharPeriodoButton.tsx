"use client";

import { useState } from "react";
import { FecharPeriodoDialog } from "@/app/components/grade/FecharPeriodoDialog";

interface FecharPeriodoButtonProps {
  planoPeriodoId: number;
  itens: { disciplinaId: number; codigo: string; nome: string }[];
}

export function FecharPeriodoButton({ planoPeriodoId, itens }: FecharPeriodoButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-caps text-primary hover:underline" type="button">
        Fechar período
      </button>
      <FecharPeriodoDialog open={open} onClose={() => setOpen(false)} planoPeriodoId={planoPeriodoId} itens={itens} />
    </>
  );
}
