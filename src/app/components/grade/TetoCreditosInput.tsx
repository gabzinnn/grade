"use client";

import { useState, useTransition } from "react";
import { atualizarTetoCreditos } from "@/actions/periodos";

interface TetoCreditosInputProps {
  planoPeriodoId: number;
  tetoCreditos: number;
}

/** Override manual do teto de créditos — útil pra reduzir a carga num período
 * de estágio, que come parte do horário disponível pra aulas. */
export function TetoCreditosInput({ planoPeriodoId, tetoCreditos }: TetoCreditosInputProps) {
  const [valor, setValor] = useState(String(tetoCreditos));
  const [pending, startTransition] = useTransition();

  function salvar() {
    const n = Number(valor);
    if (!Number.isInteger(n) || n < 1 || n === tetoCreditos) {
      setValor(String(tetoCreditos));
      return;
    }
    startTransition(async () => {
      await atualizarTetoCreditos({ planoPeriodoId, tetoCreditos: n });
    });
  }

  return (
    <input
      type="number"
      min={1}
      max={60}
      value={valor}
      disabled={pending}
      onChange={(e) => setValor(e.target.value)}
      onBlur={salvar}
      title="Teto de créditos do período (ex.: reduza durante um estágio)"
      className="w-10 rounded-chip border border-hairline bg-surface px-1 py-0.5 text-right font-data text-label text-ink-2 disabled:opacity-50"
    />
  );
}
