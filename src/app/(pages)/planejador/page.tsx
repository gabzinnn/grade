import { AppShell } from "@/app/components/AppShell";
import { PlanejadorClient } from "@/app/components/grade/PlanejadorClient";
import { buscarPlanejador } from "@/actions/planejador";

interface PlanejadorPageProps {
  searchParams: Promise<{ periodo?: string; disciplina?: string }>;
}

export default async function PlanejadorPage({ searchParams }: PlanejadorPageProps) {
  const { periodo, disciplina } = await searchParams;
  const periodoOrdem = periodo ? Number(periodo) : undefined;

  const dados = await buscarPlanejador(periodoOrdem);

  // ponytail: `?disciplina=` só semeia o estado inicial (ex.: vindo da Trilha) —
  // trocar de matéria dentro do Planejador não navega mais, fica em memória via
  // DisciplinaDetalheProvider + React Query (ver hooks/useDisciplinaDetalhe.ts).
  const alvoInicial = disciplina
    ? { disciplinaId: Number(disciplina), planoPeriodoId: dados.periodoAlvo.id }
    : null;

  return (
    <AppShell
      title="Planejador"
      subtitulo={`${dados.periodoAlvo.ordem}º período${dados.periodoAlvo.semestreLabel ? ` · ${dados.periodoAlvo.semestreLabel}` : ""}`}
      planoNome={dados.planoNome}
      usuarioNome={dados.donoNome}
    >
      <PlanejadorClient periodoOrdem={periodoOrdem} initialData={dados} alvoInicial={alvoInicial} />
    </AppShell>
  );
}
