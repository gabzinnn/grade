"use server";

import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

// Sem redirect() aqui de propósito: o cliente faz um reload completo da
// página após o await (window.location), não uma navegação client-side do
// Next. O QueryClient (React Query) vive no layout raiz e nunca é
// desmontado numa navegação soft — se o login/logout trocasse de tela sem
// recarregar o documento, o cache do usuário anterior (as query keys não
// são escopadas por perfil) continuaria sendo servido pro novo usuário.
export async function loginAction(formData: FormData) {
  const perfilId = formData.get("perfilId") as string;
  const senha = (formData.get("senha") as string) ?? "";

  if (!perfilId) return { erro: "Selecione um usuário." };

  const perfil = await db.perfil.findUnique({
    where: { id: perfilId },
    select: { id: true, senhaHash: true },
  });

  if (!perfil) return { erro: "Usuário não encontrado." };

  // Perfil sem senha configurada = acesso livre (útil no seed de dev)
  if (perfil.senhaHash) {
    const ok = await compare(senha, perfil.senhaHash);
    if (!ok) return { erro: "Senha incorreta." };
  }

  const cookieStore = await cookies();
  cookieStore.set("perfil_id", perfil.id, {
    httpOnly: true,
    path: "/",
    // 30 dias
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  return { erro: null };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("perfil_id");
}
