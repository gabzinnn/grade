import { db } from "@/lib/db";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const perfis = await db.perfil.findMany({
    select: { id: true, nome: true, apelido: true },
    orderBy: { nome: "asc" },
  });

  return <LoginForm perfis={perfis} />;
}
