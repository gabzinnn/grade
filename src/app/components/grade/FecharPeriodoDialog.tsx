"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/app/components/ui/Dialog";
import { Select } from "@/app/components/ui/Select";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { fecharPeriodo } from "@/actions/periodos";

type Status = "CONCLUIDA" | "REPROVADA" | "TRANCADA";

interface FecharPeriodoItem {
  disciplinaId: number;
  codigo: string;
  nome: string;
}

interface Decisao {
  status: Status;
  nota: string;
}

interface FecharPeriodoDialogProps {
  open: boolean;
  onClose: () => void;
  planoPeriodoId: number;
  itens: FecharPeriodoItem[];
}

export function FecharPeriodoDialog({ open, onClose, planoPeriodoId, itens }: FecharPeriodoDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [decisoes, setDecisoes] = useState<Record<number, Decisao>>(() =>
    Object.fromEntries(itens.map((i) => [i.disciplinaId, { status: "CONCLUIDA" as Status, nota: "" }])),
  );

  function atualizar(disciplinaId: number, patch: Partial<Decisao>) {
    setDecisoes((d) => ({ ...d, [disciplinaId]: { ...d[disciplinaId], ...patch } }));
  }

  function confirmar() {
    startTransition(async () => {
      await fecharPeriodo({
        planoPeriodoId,
        itens: itens.map((i) => {
          const d = decisoes[i.disciplinaId];
          return {
            disciplinaId: i.disciplinaId,
            status: d.status,
            nota: d.status === "TRANCADA" || !d.nota ? null : Number(d.nota),
          };
        }),
      });
      router.refresh();
      onClose();
    });
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <h2 className="mb-1 text-body font-semibold text-ink">Fechar período</h2>
      <p className="mb-4 text-label text-ink-2">
        Registra o resultado de cada disciplina no histórico. Depois de fechado, o período vira registro — não dá
        mais pra editar.
      </p>
      <div className="flex max-h-[360px] flex-col gap-3 overflow-y-auto">
        {itens.map((item) => {
          const d = decisoes[item.disciplinaId];
          return (
            <div key={item.disciplinaId} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm text-ink">{item.nome}</p>
                <p className="text-caps text-ink-2">{item.codigo}</p>
              </div>
              <Select
                className="w-36 shrink-0"
                value={d.status}
                onChange={(e) => atualizar(item.disciplinaId, { status: e.target.value as Status })}
              >
                <option value="CONCLUIDA">Aprovado</option>
                <option value="REPROVADA">Reprovado</option>
                <option value="TRANCADA">Trancado</option>
              </Select>
              <Input
                type="number"
                min={0}
                max={10}
                step={0.1}
                placeholder="Nota"
                className="w-20 shrink-0"
                disabled={d.status === "TRANCADA"}
                value={d.nota}
                onChange={(e) => atualizar(item.disciplinaId, { nota: e.target.value })}
              />
            </div>
          );
        })}
        {itens.length === 0 && <p className="text-label text-ink-2">Nenhuma disciplina neste período.</p>}
      </div>
      <div className="mt-5 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button className="flex-1" onClick={confirmar} disabled={pending} type="button">
          {pending ? "Fechando..." : "Confirmar e fechar"}
        </Button>
      </div>
    </Dialog>
  );
}
