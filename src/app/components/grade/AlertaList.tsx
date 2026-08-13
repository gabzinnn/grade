import { Alerta } from "@/lib/alertas";

interface AlertaListProps {
  alertas: Alerta[];
  vazio?: string;
}

export function AlertaList({ alertas, vazio = "Nenhum alerta no momento." }: AlertaListProps) {
  return (
    <div className="flex flex-col gap-2">
      {alertas.map((a, i) => (
        <div
          key={i}
          className="flex h-16 items-center justify-between rounded-block border border-hairline bg-raised px-3"
          style={{ borderLeftWidth: 3, borderLeftColor: a.tipo === "CHOQUE" ? "var(--color-danger)" : "var(--color-warn)" }}
        >
          <div className="min-w-0">
            <p className="text-body-sm font-medium leading-tight text-ink">
              {a.tipo === "CHOQUE" ? "Choque de horário" : "Pré-requisito ausente"}
            </p>
            <p className="mt-0.5 truncate text-label text-ink-2">
              {a.tipo === "CHOQUE" ? `${a.disciplinaA} × ${a.disciplinaB} na ${a.dia}` : `${a.disciplina} exige ${a.requisitoFaltante}`}
            </p>
          </div>
        </div>
      ))}
      {alertas.length === 0 && <p className="text-label text-ink-2">{vazio}</p>}
    </div>
  );
}
