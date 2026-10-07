"use client";

import { useState } from "react";
import { Input } from "@/app/components/ui/Input";
import { mediaNecessaria } from "@/lib/cr";

interface MetaCRCalculadoraProps {
  soma: number;
  creditos: number;
  creditosFuturos: number;
}

export function MetaCRCalculadora({ soma, creditos, creditosFuturos }: MetaCRCalculadoraProps) {
  const [alvo, setAlvo] = useState("");
  const media = alvo === "" ? null : mediaNecessaria({ soma, creditos }, Number(alvo), creditosFuturos);

  let resultado: string | null = null;
  if (alvo !== "") {
    if (media === null) resultado = "Nenhum crédito planejado nos próximos períodos.";
    else if (media <= 0) resultado = "Meta já garantida, qualquer nota serve.";
    else if (media > 10) resultado = `Inalcançável com os ${creditosFuturos} créditos planejados (precisaria de ${media.toFixed(2)}).`;
    else resultado = `Precisa de média ${media.toFixed(2)} nos próximos ${creditosFuturos} créditos.`;
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-label text-ink-2" htmlFor="cra-alvo">
        CRA alvo
      </label>
      <Input
        id="cra-alvo"
        type="number"
        min={0}
        max={10}
        step={0.1}
        placeholder="ex.: 8.0"
        value={alvo}
        onChange={(e) => setAlvo(e.target.value)}
      />
      {resultado && <p className="text-label text-ink">{resultado}</p>}
    </div>
  );
}
