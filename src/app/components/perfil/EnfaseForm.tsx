import { Select } from "@/app/components/ui/Select";
import { SubmitButton } from "@/app/components/ui/SubmitButton";
import { atualizarEnfases } from "@/actions/perfil";

interface EnfaseFormProps {
  planoId: number;
  categorias: { id: number; nome: string }[];
  enfasePrincipalId: number | null;
  contraEnfaseId: number | null;
}

export function EnfaseForm({ planoId, categorias, enfasePrincipalId, contraEnfaseId }: EnfaseFormProps) {
  return (
    <form action={atualizarEnfases} className="flex flex-col gap-4">
      <input type="hidden" name="planoId" value={planoId} />
      <div className="flex flex-col gap-1.5">
        <label className="text-caps text-ink-2">Ênfase escolhida</label>
        <Select name="enfasePrincipalId" defaultValue={enfasePrincipalId ?? ""}>
          <option value="">Nenhuma</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-caps text-ink-2">Contra-ênfase</label>
        <Select name="contraEnfaseId" defaultValue={contraEnfaseId ?? ""}>
          <option value="">Nenhuma</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>
      </div>
      <SubmitButton className="self-start">Salvar</SubmitButton>
    </form>
  );
}
