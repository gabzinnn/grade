import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

export async function getSessionPerfilId(): Promise<string> {
  const cookieStore = await cookies();
  const perfilId = cookieStore.get("perfil_id")?.value;
  if (!perfilId) redirect("/login");

  // Cookie presente mas apontando pra um perfil que não existe mais
  // (deletado, banco resetado etc.) — trata como não autenticado.
  const existe = await db.perfil.findUnique({ where: { id: perfilId }, select: { id: true } });
  if (!existe) {
    cookieStore.delete("perfil_id");
    redirect("/login");
  }

  return perfilId;
}

/// Mesma ideia do assertPodeEditar, mas pra leitura: qualquer papel serve.
export async function assertPodeVer(planoId: number): Promise<void> {
  const perfilId = await getSessionPerfilId();
  const plano = await db.plano.findUnique({
    where: { id: planoId },
    select: { donoId: true, acessos: { where: { perfilId }, select: { perfilId: true } } },
  });
  if (!plano) throw new Error("Plano não encontrado");
  if (plano.donoId === perfilId) return;
  if (plano.acessos.length > 0) return;
  throw new Error("Sem permissão para ver este plano");
}

/// Autorização real de escrita. RLS no Supabase é defesa em profundidade —
/// o Prisma conecta com service_role e ignora RLS, então esta checagem
/// é o que de fato impede um perfil de editar o plano de outro.
export async function assertPodeEditar(planoId: number): Promise<void> {
  const perfilId = await getSessionPerfilId();
  const plano = await db.plano.findUnique({
    where: { id: planoId },
    select: {
      donoId: true,
      acessos: {
        where: { perfilId, papel: "EDITOR" },
        select: { perfilId: true },
      },
    },
  });
  if (!plano) throw new Error("Plano não encontrado");
  if (plano.donoId === perfilId) return;
  if (plano.acessos.length > 0) return;
  throw new Error("Sem permissão para editar este plano");
}
