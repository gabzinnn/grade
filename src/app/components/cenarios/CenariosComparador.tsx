"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { ProgressBar } from "@/app/components/ui/ProgressBar";
import { IconTrash } from "@/app/components/ui/icons";
import { Dialog } from "@/app/components/ui/Dialog";
import { Input } from "@/app/components/ui/Input";
import { criarCenario, tornarPrincipal, excluirCenario } from "@/actions/cenarios";
import type { ResumoCenario } from "@/lib/cenarios";

interface CenariosComparadorProps {
  planoAId: number;
  resumoA: ResumoCenario;
  cenarios: { id: number; nome: string }[];
  planoBSelecionadoId: number | null;
  resumoB: ResumoCenario | null;
}

export function CenariosComparador({ planoAId, resumoA, cenarios, resumoB }: CenariosComparadorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [nomeNovo, setNomeNovo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function selecionarCenario(id: number) {
    router.push(`/cenarios?b=${id}`);
  }

  function criar() {
    setErro(null);
    startTransition(async () => {
      try {
        await criarCenario({ planoBaseId: planoAId, nome: nomeNovo });
        router.refresh();
        setNomeNovo("");
        setDialogAberto(false);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível criar o cenário");
      }
    });
  }

  function tornarPrincipalClick() {
    if (!resumoB) return;
    startTransition(async () => {
      await tornarPrincipal(resumoB.planoId);
      router.refresh();
    });
  }

  function excluirClick() {
    if (!resumoB) return;
    startTransition(async () => {
      await excluirCenario(resumoB.planoId);
      router.push("/cenarios");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5 pb-24">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex flex-col items-center justify-center gap-1 py-8 text-center">
          <span className="text-body font-semibold text-ink">Plano atual</span>
          <span className="text-body-sm text-ink-2">{resumoA.nome}</span>
        </Card>

        {cenarios.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <p className="text-body-sm text-ink-2">Você ainda não tem nenhum cenário alternativo.</p>
            <Button type="button" onClick={() => setDialogAberto(true)}>
              + Novo cenário
            </Button>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center gap-2 border-2 border-primary py-8 text-center">
            <select
              value={resumoB?.planoId ?? ""}
              onChange={(e) => selecionarCenario(Number(e.target.value))}
              className="rounded-control border border-hairline bg-raised px-3 py-1.5 text-body font-semibold text-ink"
            >
              {cenarios.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <div className="mt-2 flex gap-3">
              <button type="button" onClick={() => setDialogAberto(true)} className="text-caps text-primary hover:underline">
                + Novo cenário
              </button>
              <button
                type="button"
                onClick={excluirClick}
                disabled={pending}
                className="flex items-center gap-1 text-caps text-danger hover:underline disabled:opacity-40"
              >
                <IconTrash width={14} height={14} /> Excluir
              </button>
            </div>
          </Card>
        )}
      </div>

      {resumoB && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <h3 className="mb-4 text-body font-semibold text-ink">Duração do curso</h3>
              <div className="mb-2 flex items-end justify-between">
                <div>
                  <span className="mb-1 block text-caps text-ink-2">{resumoB.nome}</span>
                  <span className="text-title text-ink">{resumoB.totalPeriodos} períodos</span>
                </div>
                <div className="text-right">
                  <span className="mb-1 block text-caps text-ink-2">Atual</span>
                  <span className="text-body-sm text-ink-2">{resumoA.totalPeriodos} períodos</span>
                </div>
              </div>
              <ProgressBar
                value={resumoB.totalPeriodos}
                max={Math.max(resumoA.totalPeriodos, resumoB.totalPeriodos, resumoB.limiteOrdem)}
              />
              <p className="mt-2 text-label text-ink-2">
                {resumoB.totalPeriodos === resumoA.totalPeriodos
                  ? "Mesma duração do plano atual"
                  : resumoB.totalPeriodos > resumoA.totalPeriodos
                    ? `+${resumoB.totalPeriodos - resumoA.totalPeriodos} período(s) em relação ao atual`
                    : `${resumoA.totalPeriodos - resumoB.totalPeriodos} período(s) a menos que o atual`}
              </p>
            </Card>

            <Card>
              <h3 className="mb-4 text-body font-semibold text-ink">Ritmo de créditos/período</h3>
              <div className="mb-2 flex items-end justify-between">
                <div>
                  <span className="mb-1 block text-caps text-ink-2">{resumoB.nome}</span>
                  <span className="text-title text-ink">{resumoB.mediaCreditosPeriodo.toFixed(1)} cr</span>
                </div>
                <div className="text-right">
                  <span className="mb-1 block text-caps text-ink-2">Atual</span>
                  <span className="text-body-sm text-ink-2">{resumoA.mediaCreditosPeriodo.toFixed(1)} cr</span>
                </div>
              </div>
              <ProgressBar
                value={resumoB.mediaCreditosPeriodo}
                max={Math.max(resumoA.mediaCreditosPeriodo, resumoB.mediaCreditosPeriodo, 1)}
                colorClassName="bg-[#2F6F8F]"
              />
              <p className="mt-2 text-label text-ink-2">
                {resumoB.mediaCreditosPeriodo < resumoA.mediaCreditosPeriodo
                  ? "Carga mais leve por período"
                  : "Carga igual ou mais pesada por período"}
              </p>
            </Card>
          </div>

          <Card>
            <h3 className="mb-2 text-body font-semibold text-ink">Créditos planejados</h3>
            <div className="flex flex-wrap gap-6 text-body-sm text-ink-2">
              <span>
                {resumoA.nome}: <strong className="text-ink">{resumoA.totalObtidos + resumoA.totalPlanejado}</strong> /{" "}
                {resumoA.totalMeta} cr
              </span>
              <span>
                {resumoB.nome}: <strong className="text-ink">{resumoB.totalObtidos + resumoB.totalPlanejado}</strong> /{" "}
                {resumoB.totalMeta} cr
              </span>
            </div>
          </Card>
        </>
      )}

      <div className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-between border-t border-hairline bg-surface/90 px-4 py-4 backdrop-blur-md md:-mx-8 md:px-8">
        <Link href="/">
          <Button variant="secondary" type="button">
            Cancelar
          </Button>
        </Link>
        <Button type="button" disabled={!resumoB || pending} onClick={tornarPrincipalClick}>
          {pending ? "Aplicando..." : `Tornar "${resumoB?.nome ?? "cenário"}" principal`}
        </Button>
      </div>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)}>
        <h3 className="mb-4 text-body font-semibold text-ink">Novo cenário</h3>
        <p className="mb-3 text-body-sm text-ink-2">
          Cria uma cópia do plano atual pra você testar mudanças sem afetar o plano principal.
        </p>
        <Input
          placeholder="Nome do cenário (ex.: Estágio avançado)"
          value={nomeNovo}
          onChange={(e) => setNomeNovo(e.target.value)}
          className="w-full"
        />
        {erro && <p className="mt-2 text-label text-danger">{erro}</p>}
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" type="button" className="flex-1" onClick={() => setDialogAberto(false)}>
            Cancelar
          </Button>
          <Button type="button" className="flex-1" disabled={!nomeNovo || pending} onClick={criar}>
            {pending ? "Criando..." : "Criar cenário"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
