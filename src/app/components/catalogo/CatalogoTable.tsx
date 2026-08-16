"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { matricularNaTurma } from "@/actions/itens";
import type { CatalogoDisciplina } from "@/lib/catalogo";

const DIA_ABREV: Record<number, string> = { 1: "SEG", 2: "TER", 3: "QUA", 4: "QUI", 5: "SEX", 6: "SÁB", 7: "DOM" };

function formatHora(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface CatalogoTableProps {
  disciplinas: CatalogoDisciplina[];
  categorias: { chave: string; nome: string; cor: string }[];
  professores: string[];
  periodoAtualId: number | null;
  periodoAtualOrdem: number | null;
  cursos: { id: number; nome: string }[];
  cursoSelecionadoId: number | "all";
  podeMatricular: boolean;
}

export function CatalogoTable({
  disciplinas,
  categorias,
  professores,
  periodoAtualId,
  periodoAtualOrdem,
  cursos,
  cursoSelecionadoId,
  podeMatricular,
}: CatalogoTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adicionando, setAdicionando] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [periodoSugerido, setPeriodoSugerido] = useState("");
  const [turno, setTurno] = useState("");
  const [professor, setProfessor] = useState("");
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set());

  const periodosSugeridos = useMemo(
    () => [...new Set(disciplinas.map((d) => d.periodoSugerido).filter((p): p is number => p !== null))].sort((a, b) => a - b),
    [disciplinas],
  );

  const filtradas = disciplinas.filter((d) => {
    const buscaNormalizada = busca.trim().toLowerCase();
    if (buscaNormalizada && !d.codigo.toLowerCase().includes(buscaNormalizada) && !d.nome.toLowerCase().includes(buscaNormalizada)) return false;
    if (categoria && d.categoriaChave !== categoria) return false;
    if (periodoSugerido && String(d.periodoSugerido) !== periodoSugerido) return false;
    if (turno && !d.turmas.some((t) => t.turnos.includes(turno as "manha" | "tarde" | "noite"))) return false;
    if (professor && !d.turmas.some((t) => t.professores.includes(professor))) return false;
    return true;
  });

  function limparFiltros() {
    setBusca("");
    setCategoria("");
    setPeriodoSugerido("");
    setTurno("");
    setProfessor("");
  }

  function alternarExpandida(disciplinaId: number) {
    setExpandidas((prev) => {
      const next = new Set(prev);
      if (next.has(disciplinaId)) next.delete(disciplinaId);
      else next.add(disciplinaId);
      return next;
    });
  }

  function adicionar(disciplinaId: number, turmaId: number) {
    if (!periodoAtualId) return;
    setAdicionando(turmaId);
    startTransition(async () => {
      await matricularNaTurma(periodoAtualId, disciplinaId, turmaId);
      router.refresh();
      setAdicionando(null);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-label text-ink-2">
            Curso
            <Select
              className="min-w-[220px]"
              value={cursoSelecionadoId}
              onChange={(e) => router.push(`/catalogo?curso=${e.target.value}`)}
            >
              <option value="all">Todos os cursos</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Select>
          </label>
          <Input
            placeholder="Buscar disciplina..."
            className="min-w-[200px] flex-1"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <span className="font-data text-label text-ink-2">{filtradas.length} disciplinas</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-4">
          <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Categoria</option>
            {categorias.map((c) => (
              <option key={c.chave} value={c.chave}>
                {c.nome}
              </option>
            ))}
          </Select>
          <Select value={periodoSugerido} onChange={(e) => setPeriodoSugerido(e.target.value)}>
            <option value="">Período sugerido</option>
            {periodosSugeridos.map((p) => (
              <option key={p} value={p}>
                {p}º período
              </option>
            ))}
          </Select>
          <Select value={turno} onChange={(e) => setTurno(e.target.value)}>
            <option value="">Turno</option>
            <option value="manha">Manhã</option>
            <option value="tarde">Tarde</option>
            <option value="noite">Noite</option>
          </Select>
          <Select value={professor} onChange={(e) => setProfessor(e.target.value)}>
            <option value="">Professor</option>
            {professores.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          {(busca || categoria || periodoSugerido || turno || professor) && (
            <button type="button" onClick={limparFiltros} className="ml-auto text-body-sm text-ink-2 hover:text-primary">
              Limpar filtros
            </button>
          )}
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-b border-hairline">
            <tr>
              <th className="w-1 p-0" />
              <th className="px-4 py-3 text-caps text-ink-2">Código</th>
              <th className="px-4 py-3 text-caps text-ink-2">Disciplina</th>
              <th className="px-4 py-3 text-caps text-ink-2">Cat.</th>
              <th className="px-4 py-3 text-right text-caps text-ink-2">Créd.</th>
              <th className="px-4 py-3 text-right text-caps text-ink-2">Período</th>
              <th className="px-4 py-3 text-center text-caps text-ink-2">Turmas</th>
              <th className="px-4 py-3 text-caps text-ink-2">Horários</th>
              <th className="w-28 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtradas.map((d) => {
              const expandida = expandidas.has(d.id);
              return (
                <Fragment key={d.id}>
                  <tr
                    onClick={() => alternarExpandida(d.id)}
                    className="cursor-pointer border-b border-hairline hover:bg-recess"
                  >
                    <td className="w-1 p-0" style={{ backgroundColor: d.categoriaCor }} />
                    <td className="px-4 py-3 font-data text-label text-ink">{d.codigo}</td>
                    <td className="px-4 py-3 text-body-sm font-medium text-ink">{d.nome}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-6 items-center rounded-chip bg-recess px-2 text-caps text-ink-2">{d.categoriaNome}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-body-sm text-ink">{d.creditos}</td>
                    <td className="px-4 py-3 text-right text-body-sm text-ink">{d.periodoSugerido ? `${d.periodoSugerido}º` : "Opt."}</td>
                    <td className="px-4 py-3 text-center text-body-sm text-ink">{d.turmas.length}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {d.turmas[0]?.horarios.slice(0, 2).map((h, i) => (
                          <span key={i} className="rounded border border-hairline bg-raised px-1.5 py-0.5 text-caps text-ink-2">
                            {DIA_ABREV[h.diaSemana]} {formatHora(h.inicioMin)}
                          </span>
                        ))}
                        {d.turmas.length === 0 && <span className="text-caps text-ink-3">Sem oferta</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-ink-2">{expandida ? "▲" : "▼"}</td>
                  </tr>
                  {expandida && (
                    <tr className="border-b border-hairline bg-recess">
                      <td className="p-0" style={{ backgroundColor: d.categoriaCor }} />
                      <td colSpan={8} className="px-4 py-3">
                        {d.turmas.length === 0 ? (
                          <p className="text-label text-ink-2">Nenhuma turma ofertada neste semestre.</p>
                        ) : (
                          <table className="w-full text-body-sm">
                            <tbody>
                              {d.turmas.map((t) => (
                                <tr key={t.id} className="border-b border-hairline/50 last:border-0">
                                  <td className="py-2 pr-3 font-data text-label text-ink-2">{t.codigo}</td>
                                  <td className="py-2 pr-3 text-ink">{t.professores.join(", ") || "—"}</td>
                                  <td className="py-2 pr-3 text-ink-2">
                                    {t.horarios.map((h, i) => (
                                      <span key={i} className="mr-2">
                                        {DIA_ABREV[h.diaSemana]} {formatHora(h.inicioMin)}-{formatHora(h.fimMin)}
                                      </span>
                                    ))}
                                  </td>
                                  <td className="py-2 pr-3 text-right">
                                    {t.conflito ? (
                                      <span className="rounded-chip bg-danger/15 px-2 py-1 text-caps text-danger">
                                        Choque com o {periodoAtualOrdem}º período
                                      </span>
                                    ) : (
                                      <span className="rounded-chip bg-success/15 px-2 py-1 text-caps text-success">Sem choque</span>
                                    )}
                                  </td>
                                  <td className="py-2 text-right">
                                    {podeMatricular && periodoAtualId && !t.conflito && (
                                      <button
                                        type="button"
                                        disabled={pending && adicionando === t.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          adicionar(d.disciplinaId, t.id);
                                        }}
                                        className="rounded-control border border-primary/40 px-3 py-1 text-caps text-primary hover:bg-primary/10 disabled:opacity-40"
                                      >
                                        {pending && adicionando === t.id ? "..." : "Adicionar"}
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {filtradas.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12">
            <p className="text-body-sm text-ink-2">Nenhuma disciplina com esses filtros</p>
            <button type="button" onClick={limparFiltros} className="text-body-sm font-medium text-primary hover:underline">
              Limpar filtros
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
