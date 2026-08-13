"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconTrash } from "@/app/components/ui/icons";
import { AdicionarBlocoDialog } from "@/app/components/perfil/AdicionarBlocoDialog";
import { removerBloco } from "@/actions/perfil";

const DIA_ABREV: Record<number, string> = { 1: "SEG", 2: "TER", 3: "QUA", 4: "QUI", 5: "SEX", 6: "SÁB", 7: "DOM" };

const TIPO_LABEL: Record<string, string> = {
  ESTAGIO: "Estágio",
  TRABALHO: "Trabalho",
  PESSOAL: "Pessoal",
  DESLOCAMENTO: "Deslocamento",
};

function formatHora(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface Bloco {
  id: number;
  titulo: string;
  tipo: string;
  diaSemana: number;
  inicioMin: number;
  fimMin: number;
}

interface BlocosFixosProps {
  blocos: Bloco[];
}

export function BlocosFixos({ blocos }: BlocosFixosProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [removendo, setRemovendo] = useState<number | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);

  function remover(id: number) {
    setRemovendo(id);
    startTransition(async () => {
      await removerBloco(id);
      router.refresh();
      setRemovendo(null);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {blocos.map((b) => (
        <div key={b.id} className="group flex items-center justify-between rounded-control border border-hairline p-3 hover:bg-recess">
          <div className="flex items-center gap-3">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-caps font-semibold uppercase tracking-wider text-primary">
              {TIPO_LABEL[b.tipo] ?? b.tipo}
            </span>
            <div>
              <div className="text-body-sm font-medium text-ink">{b.titulo}</div>
              <div className="mt-0.5 font-data text-label text-ink-2">
                {DIA_ABREV[b.diaSemana]} {formatHora(b.inicioMin)} - {formatHora(b.fimMin)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => remover(b.id)}
            disabled={pending && removendo === b.id}
            className="rounded-full p-1.5 text-ink-2 opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger group-hover:opacity-100 disabled:opacity-40"
            aria-label={`Remover ${b.titulo}`}
          >
            <IconTrash width={16} height={16} />
          </button>
        </div>
      ))}
      {blocos.length === 0 && <p className="text-label text-ink-2">Nenhum horário fixo cadastrado.</p>}
      <button
        type="button"
        onClick={() => setDialogAberto(true)}
        className="mt-2 flex items-center justify-center gap-2 rounded-control border border-dashed border-primary/30 py-2 text-body-sm font-medium text-primary hover:bg-primary/10"
      >
        + Adicionar horário fixo
      </button>
      <AdicionarBlocoDialog open={dialogAberto} onClose={() => setDialogAberto(false)} />
    </div>
  );
}
