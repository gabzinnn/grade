"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { atualizarPreferencias } from "@/actions/perfil";

interface PreferenciasFormProps {
  evitarAntesDeMin: number | null;
  janelaMaximaMin: number | null;
  maxDiasPresenciais: number | null;
}

const ITENS = [
  {
    chave: "evitarAntesDeMin" as const,
    valorLigado: 540,
    titulo: "Evitar aulas antes das 09:00",
    descricao: "Tenta alocar disciplinas para o final da manhã ou tarde.",
  },
  {
    chave: "janelaMaximaMin" as const,
    valorLigado: 120,
    titulo: "Evitar janelas maiores que 2h",
    descricao: "Minimiza o tempo ocioso entre aulas no mesmo dia.",
  },
  {
    chave: "maxDiasPresenciais" as const,
    valorLigado: 4,
    titulo: "Concentrar aulas em no máximo 4 dias",
    descricao: "Prioriza grades que deixam um dia livre (geralmente sexta-feira).",
  },
];

export function PreferenciasForm(props: PreferenciasFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [valores, setValores] = useState(props);

  function alternar(chave: keyof PreferenciasFormProps, valorLigado: number) {
    const novo = { ...valores, [chave]: valores[chave] === null ? valorLigado : null };
    setValores(novo);
    startTransition(async () => {
      await atualizarPreferencias(novo);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {ITENS.map((item) => {
        const ligado = valores[item.chave] !== null;
        return (
          <div key={item.chave} className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-body-sm font-medium text-ink">{item.titulo}</span>
              <span className="text-label text-ink-2">{item.descricao}</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={ligado}
              disabled={pending}
              onClick={() => alternar(item.chave, item.valorLigado)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${ligado ? "bg-primary" : "bg-recess"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-raised shadow-resting transition-transform ${ligado ? "translate-x-[22px]" : "translate-x-0.5"}`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
