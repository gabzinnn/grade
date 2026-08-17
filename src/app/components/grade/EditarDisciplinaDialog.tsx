"use client";

import { useEffect, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog } from "@/app/components/ui/Dialog";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { buscarEdicaoDisciplina, salvarDisciplina, excluirDisciplina } from "@/actions/disciplinas";
import { planejadorQueryKey } from "@/app/components/grade/PlanejadorClient";
import { disciplinaDetalheQueryKey } from "@/hooks/useDisciplinaDetalhe";
import type { DisciplinaEditavel, OpcoesEdicaoDisciplina } from "@/lib/disciplinaEdicao";

interface EditarDisciplinaDialogProps {
  open: boolean;
  onClose: () => void;
  planoPeriodoId: number;
  disciplinaId: number | null;
  periodoOrdem?: number;
}

const DIAS = [
  { valor: 1, label: "Segunda" },
  { valor: 2, label: "Terça" },
  { valor: 3, label: "Quarta" },
  { valor: 4, label: "Quinta" },
  { valor: 5, label: "Sexta" },
  { valor: 6, label: "Sábado" },
];

function minutosDoHorario(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}
function horarioDeMinutos(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

export function EditarDisciplinaDialog({ open, onClose, planoPeriodoId, disciplinaId, periodoOrdem }: EditarDisciplinaDialogProps) {
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [opcoes, setOpcoes] = useState<OpcoesEdicaoDisciplina | null>(null);
  const [form, setForm] = useState<DisciplinaEditavel | null>(null);

  // Reseta (durante a renderização, sem efeito) sempre que o alvo muda, pra não
  // mostrar dados da disciplina anterior enquanto a nova ainda carrega.
  const chaveAtual = `${planoPeriodoId}:${disciplinaId}`;
  const [chaveAnterior, setChaveAnterior] = useState(chaveAtual);
  if (open && chaveAtual !== chaveAnterior) {
    setChaveAnterior(chaveAtual);
    setForm(null);
    setOpcoes(null);
    setErro(null);
  }

  useEffect(() => {
    if (!open) return;
    let cancelado = false;
    buscarEdicaoDisciplina(planoPeriodoId, disciplinaId).then((res) => {
      if (cancelado) return;
      setForm(res.disciplina);
      setOpcoes(res.opcoes);
    });
    return () => {
      cancelado = true;
    };
  }, [open, planoPeriodoId, disciplinaId]);

  const carregando = open && (!form || !opcoes);

  function atualizar(patch: Partial<DisciplinaEditavel>) {
    setForm((f) => (f ? { ...f, ...patch } : f));
  }

  function alternarPrereq(id: number) {
    if (!form) return;
    const tem = form.prereqIds.includes(id);
    atualizar({ prereqIds: tem ? form.prereqIds.filter((x) => x !== id) : [...form.prereqIds, id] });
  }

  function atualizarTurma(i: number, patch: Partial<DisciplinaEditavel["turmas"][number]>) {
    if (!form) return;
    atualizar({ turmas: form.turmas.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) });
  }

  function adicionarTurma() {
    if (!form) return;
    atualizar({ turmas: [...form.turmas, { codigo: `T${form.turmas.length + 1}`, nome: "", professor: "", horarios: [] }] });
  }

  function removerTurma(i: number) {
    if (!form) return;
    atualizar({ turmas: form.turmas.filter((_, idx) => idx !== i) });
  }

  function adicionarHorario(ti: number) {
    if (!form) return;
    atualizarTurma(ti, { horarios: [...form.turmas[ti].horarios, { diaSemana: 1, inicioMin: 480, fimMin: 600 }] });
  }

  function atualizarHorario(ti: number, hi: number, patch: Partial<{ diaSemana: number; inicioMin: number; fimMin: number }>) {
    if (!form) return;
    atualizarTurma(ti, { horarios: form.turmas[ti].horarios.map((h, idx) => (idx === hi ? { ...h, ...patch } : h)) });
  }

  function removerHorario(ti: number, hi: number) {
    if (!form) return;
    atualizarTurma(ti, { horarios: form.turmas[ti].horarios.filter((_, idx) => idx !== hi) });
  }

  function salvar() {
    if (!form || !opcoes) return;
    setErro(null);
    startTransition(async () => {
      try {
        await salvarDisciplina({
          disciplinaId: form.disciplinaId,
          versaoCurricularId: opcoes.versaoCurricularId,
          semestreAtualId: opcoes.semestreAtualId,
          codigo: form.codigo.trim().toUpperCase(),
          nome: form.nome.trim(),
          creditos: form.creditos,
          cargaHoraria: form.cargaHoraria,
          categoriaId: form.categoriaId,
          periodoSugerido: form.periodoSugerido,
          prereqIds: form.prereqIds,
          turmas: form.turmas,
        });
        queryClient.invalidateQueries({ queryKey: planejadorQueryKey(periodoOrdem) });
        if (form.disciplinaId) {
          queryClient.invalidateQueries({ queryKey: disciplinaDetalheQueryKey(planoPeriodoId, form.disciplinaId) });
        }
        onClose();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível salvar");
      }
    });
  }

  function excluir() {
    if (!form?.disciplinaId) return;
    if (!confirm(`Excluir ${form.codigo} do catálogo? Ela sai de todos os planos.`)) return;
    const id = form.disciplinaId;
    setErro(null);
    startTransition(async () => {
      try {
        await excluirDisciplina(id);
        queryClient.invalidateQueries({ queryKey: planejadorQueryKey(periodoOrdem) });
        queryClient.invalidateQueries({ queryKey: disciplinaDetalheQueryKey(planoPeriodoId, id) });
        onClose();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível excluir");
      }
    });
  }

  return (
    <Dialog open={open} onClose={onClose} className="max-w-2xl">
      <h3 className="mb-4 text-body font-semibold text-ink">{form?.disciplinaId ? `Editar ${form.codigo}` : "Nova disciplina"}</h3>

      {carregando || !form || !opcoes ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-label text-ink-2">
              Código
              <Input
                value={form.codigo}
                onChange={(e) => atualizar({ codigo: e.target.value.toUpperCase() })}
                disabled={form.disciplinaId !== null}
              />
            </label>
            <label className="flex flex-col gap-1 text-label text-ink-2">
              Créditos
              <Input
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={form.creditos}
                onChange={(e) => atualizar({ creditos: Number(e.target.value) })}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-label text-ink-2">
            Nome
            <Input value={form.nome} onChange={(e) => atualizar({ nome: e.target.value })} />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1 text-label text-ink-2">
              Carga horária
              <Input type="number" min={0} value={form.cargaHoraria} onChange={(e) => atualizar({ cargaHoraria: Number(e.target.value) })} />
            </label>
            <label className="flex flex-col gap-1 text-label text-ink-2">
              Categoria
              <Select
                value={form.categoriaId ?? ""}
                onChange={(e) => atualizar({ categoriaId: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">Nenhuma</option>
                {opcoes.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1 text-label text-ink-2">
              Período sugerido
              <Input
                type="number"
                min={1}
                max={20}
                value={form.periodoSugerido ?? ""}
                onChange={(e) => atualizar({ periodoSugerido: e.target.value ? Number(e.target.value) : null })}
              />
            </label>
          </div>

          <div>
            <p className="mb-1.5 text-label text-ink-2">Pré-requisitos</p>
            <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-control border border-hairline p-2">
              {opcoes.disciplinasParaPrereq.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-body-sm text-ink">
                  <input type="checkbox" checked={form.prereqIds.includes(d.id)} onChange={() => alternarPrereq(d.id)} />
                  <span className="font-data text-caps text-ink-2">{d.codigo}</span> {d.nome}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-label text-ink-2">Turmas (semestre atual)</p>
              <button type="button" onClick={adicionarTurma} className="text-caps text-primary hover:underline">
                + turma
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {form.turmas.map((t, ti) => (
                <div key={ti} className="rounded-control border border-hairline p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Input className="w-24" placeholder="código" value={t.codigo} onChange={(e) => atualizarTurma(ti, { codigo: e.target.value })} />
                    <Input className="flex-1" placeholder="nome/sala" value={t.nome} onChange={(e) => atualizarTurma(ti, { nome: e.target.value })} />
                    <Input
                      className="flex-1"
                      placeholder="professor(a)"
                      value={t.professor}
                      onChange={(e) => atualizarTurma(ti, { professor: e.target.value })}
                    />
                    <button type="button" onClick={() => removerTurma(ti)} className="shrink-0 text-caps text-danger hover:underline">
                      excluir
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {t.horarios.map((h, hi) => (
                      <div key={hi} className="flex items-center gap-2">
                        <Select
                          className="w-28"
                          value={h.diaSemana}
                          onChange={(e) => atualizarHorario(ti, hi, { diaSemana: Number(e.target.value) })}
                        >
                          {DIAS.map((d) => (
                            <option key={d.valor} value={d.valor}>
                              {d.label}
                            </option>
                          ))}
                        </Select>
                        <Input
                          type="time"
                          value={horarioDeMinutos(h.inicioMin)}
                          onChange={(e) => atualizarHorario(ti, hi, { inicioMin: minutosDoHorario(e.target.value) })}
                        />
                        <span className="text-ink-2">até</span>
                        <Input
                          type="time"
                          value={horarioDeMinutos(h.fimMin)}
                          onChange={(e) => atualizarHorario(ti, hi, { fimMin: minutosDoHorario(e.target.value) })}
                        />
                        <button type="button" onClick={() => removerHorario(ti, hi)} className="text-caps text-ink-2 hover:text-danger">
                          ×
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => adicionarHorario(ti)} className="self-start text-caps text-primary hover:underline">
                      + horário
                    </button>
                  </div>
                </div>
              ))}
              {form.turmas.length === 0 && <p className="text-label text-ink-2">Nenhuma turma cadastrada.</p>}
            </div>
          </div>

          {erro && <p className="text-label text-danger">{erro}</p>}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        {form?.disciplinaId && (
          <Button variant="secondary" type="button" className="mr-auto text-danger" disabled={pending} onClick={excluir}>
            Excluir disciplina
          </Button>
        )}
        <Button variant="secondary" type="button" onClick={onClose} disabled={pending}>
          Cancelar
        </Button>
        <Button type="button" onClick={salvar} disabled={pending || !form?.codigo || !form?.nome}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </Dialog>
  );
}
