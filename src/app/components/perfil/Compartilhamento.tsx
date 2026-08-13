import { Avatar } from "@/app/components/ui/Avatar";
import { Select } from "@/app/components/ui/Select";
import { SubmitButton } from "@/app/components/ui/SubmitButton";
import { AcessoRow } from "@/app/components/perfil/AcessoRow";
import { adicionarAcesso } from "@/actions/perfil";

interface CompartilhamentoProps {
  planoId: number;
  dono: { id: string; nome: string };
  acessos: { perfilId: string; papel: "EDITOR" | "LEITOR"; perfil: { id: string; nome: string; apelido: string | null } }[];
  outrosPerfis: { id: string; nome: string; apelido: string | null }[];
}

export function Compartilhamento({ planoId, dono, acessos, outrosPerfis }: CompartilhamentoProps) {
  return (
    <div className="flex flex-col gap-4">
      <table className="w-full text-left">
        <tbody>
          <tr className="border-b border-hairline/50">
            <td className="w-12 py-3">
              <Avatar nome={dono.nome} />
            </td>
            <td className="py-3 text-body-sm font-medium text-ink">{dono.nome}</td>
            <td className="py-3 text-right text-body-sm text-ink-2">Dono</td>
          </tr>
          {acessos.map((a) => (
            <AcessoRow
              key={a.perfilId}
              planoId={planoId}
              perfilId={a.perfilId}
              nome={a.perfil.apelido ?? a.perfil.nome}
              papel={a.papel}
            />
          ))}
        </tbody>
      </table>

      {outrosPerfis.length > 0 && (
        <form action={adicionarAcesso} className="flex flex-wrap gap-3">
          <input type="hidden" name="planoId" value={planoId} />
          <Select name="perfilConvidadoId" required className="flex-1">
            {outrosPerfis.map((p) => (
              <option key={p.id} value={p.id}>
                {p.apelido ?? p.nome}
              </option>
            ))}
          </Select>
          <Select name="papel" defaultValue="LEITOR">
            <option value="LEITOR">Pode ver</option>
            <option value="EDITOR">Pode editar</option>
          </Select>
          <SubmitButton>Convidar</SubmitButton>
        </form>
      )}
    </div>
  );
}
