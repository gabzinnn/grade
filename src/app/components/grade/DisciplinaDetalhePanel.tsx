"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog } from "@/app/components/ui/Dialog";
import { Button } from "@/app/components/ui/Button";
import { IconX, IconCheck, IconTrash, IconEdit } from "@/app/components/ui/icons";
import { matricularNaTurma, removerItem } from "@/actions/itens";
import { disciplinaDetalheQueryKey, useDisciplinaDetalhe } from "@/hooks/useDisciplinaDetalhe";
import { useDisciplinaDetalheContext, DisciplinaAlvo } from "@/app/components/grade/DisciplinaDetalheContext";
import { EditarDisciplinaDialog } from "@/app/components/grade/EditarDisciplinaDialog";
import { planejadorQueryKey } from "@/app/components/grade/PlanejadorClient";

const DIA_ABREV: Record<number, string> = { 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb", 7: "Dom" };

function formatHora(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

interface DisciplinaDetalhePanelProps {
  periodoOrdem?: number;
}

export function DisciplinaDetalhePanel({ periodoOrdem }: DisciplinaDetalhePanelProps) {
  const { alvo, fechar } = useDisciplinaDetalheContext();
  const queryClient = useQueryClient();
  const {
    data: dados,
    isLoading,
    isError,
    error,
    refetch,
  } = useDisciplinaDetalhe(alvo?.planoPeriodoId ?? 0, alvo?.disciplinaId ?? null);
  const [pending, startTransition] = useTransition();
  const [removendo, startRemocao] = useTransition();
  const [editando, setEditando] = useState(false);

  // Escolha manual de turma. Reseta (durante a renderização, sem efeito) sempre
  // que o alvo muda, pra não vazar a seleção de uma disciplina pra outra.
  const [turmaEscolhida, setTurmaEscolhida] = useState<number | null>(null);
  const [alvoAnterior, setAlvoAnterior] = useState<DisciplinaAlvo | null>(alvo);
  if (alvo !== alvoAnterior) {
    setAlvoAnterior(alvo);
    setTurmaEscolhida(null);
  }
  const turmaId = turmaEscolhida ?? dados?.turmaSelecionadaId ?? null;

  function matricular() {
    if (!alvo) return;
    startTransition(async () => {
      await matricularNaTurma(alvo.planoPeriodoId, alvo.disciplinaId, turmaId);
      queryClient.invalidateQueries({ queryKey: disciplinaDetalheQueryKey(alvo.planoPeriodoId, alvo.disciplinaId) });
      queryClient.invalidateQueries({ queryKey: planejadorQueryKey(periodoOrdem) });
      fechar();
    });
  }

  function remover() {
    if (!dados?.planoItemId) return;
    startRemocao(async () => {
      await removerItem(dados.planoItemId!);
      queryClient.invalidateQueries({ queryKey: planejadorQueryKey(periodoOrdem) });
      fechar();
    });
  }

  const turmaSelecionada = dados?.turmas.find((t) => t.id === turmaId);
  const jaMatriculado = dados?.planoItemId !== null && dados?.planoItemId !== undefined;
  const turmaInalterada = jaMatriculado && turmaId === dados?.turmaSelecionadaId;

  return (
    <>
    <Dialog open={alvo !== null} onClose={fechar} className="max-w-2xl">
        {/* Três estados distintos — antes todos caíam no mesmo spinner, então
            erro e "não encontrada" viravam carregamento infinito. */}
        {alvo && isLoading && (
          <div className="flex min-h-[200px] items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {alvo && isError && (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
            <p className="text-body-sm font-medium text-ink">Não deu pra carregar esta disciplina.</p>
            <p className="max-w-sm text-label text-ink-2">{(error as Error)?.message}</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={fechar} type="button">
                Fechar
              </Button>
              <Button onClick={() => refetch()} type="button">
                Tentar de novo
              </Button>
            </div>
          </div>
        )}

        {alvo && !isLoading && !isError && dados === null && (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
            <p className="text-body-sm font-medium text-ink">Disciplina não encontrada neste período.</p>
            <p className="max-w-sm text-label text-ink-2">
              Ela pode ter sido removida do plano ou não pertencer a esta versão curricular.
            </p>
            <Button variant="secondary" onClick={fechar} type="button">
              Fechar
            </Button>
          </div>
        )}

        {dados && (
          <>
            <header className="mb-4 flex items-start justify-between gap-3">
              <div>
                <span className="mb-1 block text-caps uppercase text-primary">{dados.codigo}</span>
                <h2 className="text-title font-semibold text-ink">{dados.nome}</h2>
                <div className="mt-2 flex items-center gap-2 font-data text-label text-ink-2">
                  <span>{dados.cargaHoraria}h</span>
                  <span>·</span>
                  <span>{dados.creditos} créditos</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setEditando(true)}
                  className="rounded-full p-2 text-ink-2 hover:bg-recess"
                  aria-label="Editar dados"
                  title="Editar dados"
                >
                  <IconEdit width={16} height={16} />
                </button>
                <button onClick={fechar} className="rounded-full p-2 text-ink-2 hover:bg-recess" aria-label="Fechar">
                  <IconX />
                </button>
              </div>
            </header>

            <div className="max-h-[55vh] space-y-8 overflow-y-auto pr-1">
              <section>
                <h3 className="mb-3 text-body font-semibold text-ink">Turmas disponíveis</h3>
                <div className="flex flex-col gap-2">
                  {dados.turmas.map((t) => {
                    const selecionada = t.id === turmaId;
                    const bloqueada = !!t.conflito;
                    const eAAtual = jaMatriculado && t.id === dados.turmaSelecionadaId;
                    return (
                      <div
                        key={t.id}
                        onClick={() => !bloqueada && setTurmaEscolhida(t.id)}
                        className={`relative rounded-card border p-4 ${
                          bloqueada
                            ? "cursor-not-allowed border-danger/30 bg-danger/10"
                            : selecionada
                              ? "cursor-pointer border-2 border-primary shadow-resting"
                              : "cursor-pointer border-hairline shadow-resting hover:bg-recess"
                        }`}
                      >
                        {selecionada && !bloqueada && (
                          <span className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-bl-card bg-primary text-raised">
                            <IconCheck width={14} height={14} />
                          </span>
                        )}
                        <div className="flex items-start justify-between pr-6">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-ink">Turma {t.codigo}</span>
                              {eAAtual && (
                                <span className="rounded-chip bg-primary/12 px-2 py-0.5 text-caps text-primary">
                                  Sua turma
                                </span>
                              )}
                            </div>
                            {t.professor && <p className="mt-0.5 text-label text-ink-2">{t.professor}</p>}
                          </div>
                          <div className="text-right font-data text-label text-ink-2">
                            {t.horarios.map((h, i) => (
                              <div key={i} className={bloqueada ? "line-through opacity-70" : ""}>
                                {DIA_ABREV[h.diaSemana]} {formatHora(h.inicioMin)} - {formatHora(h.fimMin)}
                              </div>
                            ))}
                          </div>
                        </div>
                        {t.horarios[0]?.local && !bloqueada && (
                          <div className="mt-3 flex gap-2">
                            <span className="rounded-chip border border-hairline bg-recess px-2 py-1 text-caps text-ink-2">
                              {t.horarios[0].local}
                            </span>
                          </div>
                        )}
                        {bloqueada && (
                          <div className="mt-3 rounded-block bg-danger/15 p-2 text-label text-danger">
                            <strong>Conflito de horário</strong> com {t.conflito!.comNome} ({t.conflito!.comCodigo}) na{" "}
                            {t.conflito!.dia}.
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {dados.turmas.length === 0 && (
                    <p className="text-label text-ink-2">Nenhuma turma ofertada neste período.</p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-body font-semibold text-ink">Pré-requisitos</h3>
                <div className="relative pl-3">
                  <div className="absolute bottom-4 left-[11px] top-4 w-px bg-hairline" />
                  <ul className="space-y-4">
                    {dados.prerequisitos.map((p) => (
                      <li key={p.disciplinaId} className="relative flex items-start gap-4">
                        <div
                          className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-surface ${
                            p.concluido ? "bg-primary text-raised" : "bg-recess text-ink-3"
                          }`}
                        >
                          {p.concluido && <IconCheck width={12} height={12} />}
                        </div>
                        <div className="pt-0.5">
                          <span className={`text-caps uppercase ${p.concluido ? "text-primary" : "text-ink-3"}`}>
                            {p.concluido ? "Concluído" : "Pendente"}
                          </span>
                          <div className="mt-0.5 font-medium text-ink">
                            {p.nome} ({p.codigo})
                          </div>
                        </div>
                      </li>
                    ))}
                    <li className="relative flex items-start gap-4">
                      <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-surface">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <div className="pt-0.5">
                        <span className="text-caps uppercase text-ink-2">Disciplina atual</span>
                        <div className="mt-0.5 font-medium text-ink">
                          {dados.nome} ({dados.codigo})
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </section>

              {dados.destrava.length > 0 && (
                <section>
                  <h3 className="mb-3 text-body font-semibold text-ink">Impacto no curso</h3>
                  <div className="rounded-card border border-hairline bg-recess p-4">
                    <p className="mb-3 border-b border-hairline pb-3 font-semibold text-ink">Destrava (libera)</p>
                    <ul className="space-y-3">
                      {dados.destrava.map((d) => (
                        <li key={d.disciplinaId} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-block border border-hairline bg-surface font-data text-caps font-semibold text-ink-2">
                            {d.codigo.slice(0, 3)}
                          </div>
                          <div>
                            <div className="text-body-sm font-medium text-ink">{d.nome}</div>
                            <div className="text-caps text-ink-2">
                              {d.categoriaNome}
                              {d.periodoSugerido ? <span className="font-data"> · {d.periodoSugerido}º Período</span> : ""}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}
            </div>

            <footer className="mt-5 flex gap-3 border-t border-hairline pt-4">
              {dados.planoItemId !== null && (
                <button
                  onClick={remover}
                  disabled={removendo}
                  type="button"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-danger/30 text-danger transition-colors hover:bg-danger/10 disabled:opacity-40"
                  aria-label="Remover da grade"
                  title="Remover da grade"
                >
                  {removendo ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <IconTrash />
                  )}
                </button>
              )}
              <Button variant="secondary" className="flex-1" onClick={fechar} type="button">
                Cancelar
              </Button>
              <Button
                className="flex-[2]"
                onClick={matricular}
                disabled={!turmaId || pending || turmaInalterada}
                type="button"
              >
                {pending ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Salvando...
                  </span>
                ) : turmaInalterada ? (
                  "Já matriculado nesta turma"
                ) : jaMatriculado ? (
                  `Trocar para Turma ${turmaSelecionada?.codigo ?? ""}`
                ) : (
                  `Matricular na Turma ${turmaSelecionada?.codigo ?? ""}`
                )}
              </Button>
            </footer>
          </>
        )}
    </Dialog>
    <EditarDisciplinaDialog
      open={editando}
      onClose={() => setEditando(false)}
      planoPeriodoId={alvo?.planoPeriodoId ?? 0}
      disciplinaId={dados?.disciplinaId ?? alvo?.disciplinaId ?? null}
      periodoOrdem={periodoOrdem}
    />
    </>
  );
}
