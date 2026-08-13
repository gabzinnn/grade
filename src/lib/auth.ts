import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { db } from "./db";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // chamado de um Server Component sem permissão de escrita de cookie;
            // a sessão é refrescada pelo middleware nesse caso.
          }
        },
      },
    },
  );
}

export async function getSessionPerfilId(): Promise<string> {
  // ponytail: sem tela de login ainda — atalho de dev pra testar localmente
  // com os perfis do seed. Só ativa se a env var existir; nunca em produção.
  if (process.env.DEV_MOCK_PERFIL_ID) return process.env.DEV_MOCK_PERFIL_ID;

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return user.id;
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
