"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionPerfilId, assertPodeEditar } from "@/lib/auth";

const EnfasesSchema = z.object({
  planoId: z.coerce.number().int(),
  enfasePrincipalId: z.coerce.number().int().nullable(),
  contraEnfaseId: z.coerce.number().int().nullable(),
});

export async function atualizarEnfases(formData: FormData): Promise<void> {
  const dados = EnfasesSchema.parse({
    planoId: formData.get("planoId"),
    enfasePrincipalId: formData.get("enfasePrincipalId") || null,
    contraEnfaseId: formData.get("contraEnfaseId") || null,
  });
  await assertPodeEditar(dados.planoId);

  await db.plano.update({
    where: { id: dados.planoId },
    data: { enfasePrincipalId: dados.enfasePrincipalId, contraEnfaseId: dados.contraEnfaseId },
  });

  revalidatePath("/perfil");
  revalidatePath("/trilha");
  revalidatePath("/");
}

const BlocoSchema = z.object({
  titulo: z.string().min(1).max(60),
  tipo: z.enum(["ESTAGIO", "TRABALHO", "PESSOAL", "DESLOCAMENTO"]),
  diaSemana: z.number().int().min(1).max(7),
  inicioMin: z.number().int().min(0).max(1439),
  fimMin: z.number().int().min(0).max(1439),
});

export async function criarBloco(input: z.infer<typeof BlocoSchema>): Promise<void> {
  const dados = BlocoSchema.parse(input);
  if (dados.fimMin <= dados.inicioMin) throw new Error("Horário de fim precisa ser depois do início");
  const perfilId = await getSessionPerfilId();

  await db.blocoIndisponibilidade.create({ data: { ...dados, perfilId } });

  revalidatePath("/perfil");
  revalidatePath("/nossa-semana");
}

export async function removerBloco(blocoId: number): Promise<void> {
  const perfilId = await getSessionPerfilId();
  await db.blocoIndisponibilidade.deleteMany({ where: { id: blocoId, perfilId } });

  revalidatePath("/perfil");
  revalidatePath("/nossa-semana");
}

const PreferenciasSchema = z.object({
  evitarAntesDeMin: z.number().int().nullable(),
  janelaMaximaMin: z.number().int().nullable(),
  maxDiasPresenciais: z.number().int().nullable(),
});

export async function atualizarPreferencias(input: z.infer<typeof PreferenciasSchema>): Promise<void> {
  const dados = PreferenciasSchema.parse(input);
  const perfilId = await getSessionPerfilId();

  await db.preferencia.upsert({
    where: { perfilId },
    update: dados,
    create: { perfilId, ...dados },
  });

  revalidatePath("/perfil");
}

const AdicionarAcessoSchema = z.object({
  planoId: z.coerce.number().int(),
  perfilConvidadoId: z.string().uuid(),
  papel: z.enum(["EDITOR", "LEITOR"]),
});

export async function adicionarAcesso(formData: FormData): Promise<void> {
  const dados = AdicionarAcessoSchema.parse({
    planoId: formData.get("planoId"),
    perfilConvidadoId: formData.get("perfilConvidadoId"),
    papel: formData.get("papel"),
  });

  const plano = await db.plano.findUniqueOrThrow({ where: { id: dados.planoId }, select: { donoId: true } });
  const perfilId = await getSessionPerfilId();
  if (plano.donoId !== perfilId) throw new Error("Só o dono pode compartilhar o plano");

  await db.planoAcesso.upsert({
    where: { planoId_perfilId: { planoId: dados.planoId, perfilId: dados.perfilConvidadoId } },
    update: { papel: dados.papel },
    create: { planoId: dados.planoId, perfilId: dados.perfilConvidadoId, papel: dados.papel },
  });

  revalidatePath("/perfil");
}

export async function alterarPapelAcesso(planoId: number, perfilConvidadoId: string, papel: "EDITOR" | "LEITOR"): Promise<void> {
  const plano = await db.plano.findUniqueOrThrow({ where: { id: planoId }, select: { donoId: true } });
  const perfilId = await getSessionPerfilId();
  if (plano.donoId !== perfilId) throw new Error("Só o dono pode alterar o acesso");

  await db.planoAcesso.update({ where: { planoId_perfilId: { planoId, perfilId: perfilConvidadoId } }, data: { papel } });

  revalidatePath("/perfil");
}

export async function removerAcesso(planoId: number, perfilConvidadoId: string): Promise<void> {
  const plano = await db.plano.findUniqueOrThrow({ where: { id: planoId }, select: { donoId: true } });
  const perfilId = await getSessionPerfilId();
  if (plano.donoId !== perfilId) throw new Error("Só o dono pode remover acesso");

  await db.planoAcesso.delete({ where: { planoId_perfilId: { planoId, perfilId: perfilConvidadoId } } });

  revalidatePath("/perfil");
}
