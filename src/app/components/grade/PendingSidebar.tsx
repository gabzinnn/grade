"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/app/components/ui/Input";
import { Chip } from "@/app/components/ui/Chip";
import { DisciplinaBlockTrigger } from "@/app/components/grade/DisciplinaBlockTrigger";
import { EditarDisciplinaDialog } from "@/app/components/grade/EditarDisciplinaDialog";
import { adicionarItemAoPeriodo } from "@/actions/itens";
import { planejadorQueryKey } from "@/app/components/grade/PlanejadorClient";
import { Turno } from "@/lib/schedule";

export interface PendingItemData {
  disciplinaId: number;
  codigo: string;
  nome: string;
  creditos: number;
  corDisciplina: string;
  categoriaChave: string;
  categoriaNome: string;
  categoriaCor: string;
  bloqueada: boolean;
  reprovada: boolean;
  turno: Turno | null;
}

interface PendingSidebarProps {
  planoPeriodoId: number;
  itens: PendingItemData[];
  periodoOrdem?: number;
}

const TURNOS: { valor: Turno; label: string }[] = [
  { valor: "manha", label: "Manhã" },
  { valor: "tarde", label: "Tarde" },
  { valor: "noite", label: "Noite" },
];

export function PendingSidebar({ planoPeriodoId, itens, periodoOrdem }: PendingSidebarProps) {
  const [busca, setBusca] = useState("");
  const [turno, setTurno] = useState<Turno | null>(null);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [novaAberta, setNovaAberta] = useState(false);
  const queryClient = useQueryClient();

  const adicionar = useMutation({
    mutationFn: (disciplinaId: number) => {
      const formData = new FormData();
      formData.set("planoPeriodoId", String(planoPeriodoId));
      formData.set("disciplinaId", String(disciplinaId));
      return adicionarItemAoPeriodo(formData);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planejadorQueryKey(periodoOrdem) }),
  });

  const categorias = [...new Map(itens.map((i) => [i.categoriaChave, { chave: i.categoriaChave, nome: i.categoriaNome, cor: i.categoriaCor }])).values()];

  const buscaNormalizada = busca.trim().toLowerCase();
  const itensFiltrados = itens
    .filter(
      (item) =>
        !buscaNormalizada ||
        item.codigo.toLowerCase().includes(buscaNormalizada) ||
        item.nome.toLowerCase().includes(buscaNormalizada),
    )
    .filter((item) => !turno || item.turno === turno)
    .filter((item) => !categoria || item.categoriaChave === categoria);

  return (
    <aside className="flex h-full w-full flex-col rounded-card border border-hairline bg-surface">
      <div className="border-b border-hairline p-4">
        <h3 className="mb-3 text-body font-semibold text-ink">Disciplinas pendentes</h3>
        <Input
          placeholder="Buscar por código ou nome..."
          className="mb-3 w-full"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className="mb-1.5 flex gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoria(null)}
            className={`inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-chip border px-3 text-caps uppercase tracking-[0.06em] ${
              categoria === null ? "border-primary bg-primary text-raised" : "border-hairline bg-surface text-ink-2 hover:bg-recess"
            }`}
          >
            Todas categorias
          </button>
          {categorias.map((c) => {
            const ativa = categoria === c.chave;
            return (
              <button
                key={c.chave}
                type="button"
                onClick={() => setCategoria(ativa ? null : c.chave)}
                className="inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-chip border px-3 text-caps uppercase tracking-[0.06em]"
                style={
                  ativa
                    ? { backgroundColor: c.cor, borderColor: c.cor, color: "var(--color-raised)" }
                    : { backgroundColor: `${c.cor}1A`, borderColor: `${c.cor}55`, color: c.cor }
                }
              >
                {c.nome}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <Chip active={turno === null} className="shrink-0 cursor-pointer whitespace-nowrap" onClick={() => setTurno(null)}>
            Todos turnos
          </Chip>
          {TURNOS.map((t) => (
            <Chip key={t.valor} active={turno === t.valor} className="shrink-0 cursor-pointer whitespace-nowrap" onClick={() => setTurno(t.valor)}>
              {t.label}
            </Chip>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {itensFiltrados.map((item) => (
          <div
            key={item.disciplinaId}
            className={`flex h-11 items-center gap-3 rounded-block border border-hairline bg-surface px-3 ${item.bloqueada ? "opacity-45" : ""}`}
            style={{ borderLeftWidth: 3, borderLeftColor: item.reprovada ? "var(--color-danger)" : item.categoriaCor }}
          >
            <DisciplinaBlockTrigger
              disciplinaId={item.disciplinaId}
              planoPeriodoId={planoPeriodoId}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <span
                className="w-16 shrink-0 text-caps font-semibold"
                style={{ color: item.reprovada ? "var(--color-danger)" : item.corDisciplina }}
              >
                {item.codigo}
              </span>
              <span className="flex-1 truncate text-body-sm text-ink">{item.nome}</span>
            </DisciplinaBlockTrigger>
            {item.bloqueada ? (
              <span className="shrink-0 text-caps text-ink-3">Pré-req</span>
            ) : item.reprovada ? (
              <span className="shrink-0 text-caps text-danger">Reprovação</span>
            ) : (
              <span className="shrink-0 font-data text-caps text-ink-2">{item.creditos} cr</span>
            )}
            {!item.bloqueada && (
              <button
                type="button"
                onClick={() => adicionar.mutate(item.disciplinaId)}
                disabled={adicionar.isPending && adicionar.variables === item.disciplinaId}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-recess disabled:opacity-40"
                aria-label={`Adicionar ${item.nome}`}
              >
                {adicionar.isPending && adicionar.variables === item.disciplinaId ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  "+"
                )}
              </button>
            )}
          </div>
        ))}
        {itensFiltrados.length === 0 && (
          <p className="p-3 text-label text-ink-2">
            {itens.length === 0 ? "Nenhuma disciplina pendente." : "Nenhuma disciplina encontrada."}
          </p>
        )}
      </div>
      <div className="border-t border-hairline p-3">
        <button
          type="button"
          onClick={() => setNovaAberta(true)}
          className="flex w-full items-center justify-center gap-2 rounded-control border border-dashed border-primary/30 py-2 text-body-sm font-medium text-primary hover:bg-primary/10"
        >
          + Nova disciplina
        </button>
      </div>
      <EditarDisciplinaDialog
        open={novaAberta}
        onClose={() => setNovaAberta(false)}
        planoPeriodoId={planoPeriodoId}
        disciplinaId={null}
        periodoOrdem={periodoOrdem}
      />
    </aside>
  );
}
