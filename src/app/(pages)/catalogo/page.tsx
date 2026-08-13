import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/AppShell";
import { CatalogoTable } from "@/app/components/catalogo/CatalogoTable";
import { getSessionPerfilId } from "@/lib/auth";
import { construirCatalogo } from "@/lib/catalogo";

export default async function CatalogoPage() {
  const perfilId = await getSessionPerfilId();
  const dados = await construirCatalogo(perfilId);
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
      />
    </AppShell>
  );
}
