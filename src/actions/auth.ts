"use server";

import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

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

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("perfil_id");
  redirect("/login");
}
