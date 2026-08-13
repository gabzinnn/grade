"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/app/components/ui/Avatar";
import { IconTrash } from "@/app/components/ui/icons";
import { alterarPapelAcesso, removerAcesso } from "@/actions/perfil";

interface AcessoRowProps {
  planoId: number;
  perfilId: string;
  nome: string;
  papel: "EDITOR" | "LEITOR";
}

export function AcessoRow({ planoId, perfilId, nome, papel }: AcessoRowProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [papelLocal, setPapelLocal] = useState(papel);

  function alterar(novoPapel: "EDITOR" | "LEITOR") {
    setPapelLocal(novoPapel);
    startTransition(async () => {
      await alterarPapelAcesso(planoId, perfilId, novoPapel);
      router.refresh();
    });
  }

  function remover() {
    startTransition(async () => {
      await removerAcesso(planoId, perfilId);
      router.refresh();
    });
  }

  return (
    <tr className="border-b border-hairline/50 last:border-0">
      <td className="w-12 py-3">
        <Avatar nome={nome} />
      </td>
      <td className="py-3 text-body-sm font-medium text-ink">{nome}</td>
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <select
            value={papelLocal}
            onChange={(e) => alterar(e.target.value as "EDITOR" | "LEITOR")}
            disabled={pending}
            className="rounded border border-transparent bg-transparent px-2 py-1 text-body-sm text-ink-2 hover:border-hairline focus:outline-none"
          >
            <option value="EDITOR">Pode editar</option>
            <option value="LEITOR">Pode ver</option>
          </select>
          <button
            type="button"
            onClick={remover}
            disabled={pending}
            className="rounded-full p-1.5 text-ink-2 hover:bg-danger/10 hover:text-danger disabled:opacity-40"
            aria-label={`Remover acesso de ${nome}`}
          >
            <IconTrash width={16} height={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
