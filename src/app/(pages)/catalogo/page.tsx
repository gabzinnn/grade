import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { CatalogoTable } from "@/app/components/catalogo/CatalogoTable";
import { getSessionPerfilId } from "@/lib/auth";
import { construirCatalogo } from "@/lib/catalogo";

interface CatalogoPageProps {
  searchParams: Promise<{ curso?: string }>;
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const { curso } = await searchParams;
  const perfilId = await getSessionPerfilId();
  const dados = await construirCatalogo(perfilId, curso === "all" ? "all" : curso ? Number(curso) : undefined);
  if (!dados) notFound();

  return (
    <AppShell
      title="Catálogo"
      subtitulo={`${dados.disciplinas.length} disciplinas`}
      planoNome={dados.planoNome}
      usuarioNome={dados.usuarioNome}
    >
      <CatalogoTable
        disciplinas={dados.disciplinas}
        categorias={dados.categorias}
        professores={dados.professores}
        periodoAtualId={dados.periodoAtualId}
        periodoAtualOrdem={dados.periodoAtualOrdem}
        cursos={dados.cursos}
        cursoSelecionadoId={dados.cursoSelecionadoId}
        podeMatricular={dados.podeMatricular}
      />
    </AppShell>
  );
}
