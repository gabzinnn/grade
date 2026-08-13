import { Card } from "@/app/components/ui/Card";
import { EstagioTurnos } from "@/lib/estagio";

const DIA_LABEL: Record<number, string> = { 1: "SEG", 2: "TER", 3: "QUA", 4: "QUI", 5: "SEX" };

interface EstagioTurnosCardProps {
  estagio: EstagioTurnos;
}

export function EstagioTurnosCard({ estagio }: EstagioTurnosCardProps) {
  const cheio = estagio.score === 5;

  return (
    <Card>
      <h3 className="mb-4 text-body font-semibold text-ink">Estágio — turnos livres (Seg–Sex)</h3>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="shrink-0 text-center sm:text-left">
          <p className="text-label text-ink-2">dias aproveitáveis</p>
          <p className={`font-data text-title font-semibold ${cheio ? "text-success" : "text-ink"}`}>
            {estagio.score}
            <span className="text-body text-ink-3">/5</span>
          </p>
        </div>

        <div className="grid flex-1 grid-cols-5 gap-2">
          {estagio.dias.map((d) => (
            <div
              key={d.diaSemana}
              className={`rounded-control border p-2 text-center ${
                d.aproveitavel ? "border-hairline bg-raised" : "border-danger/30 bg-danger/5"
              }`}
            >
              <p className="text-caps text-ink-2">{DIA_LABEL[d.diaSemana]}</p>
              <p className="mt-0.5 text-body-sm">{d.aproveitavel ? "✅" : "✖"}</p>
              <div className="mt-2 flex flex-col gap-1">
                <span className={`rounded px-1 py-0.5 text-caps ${d.manhaLivre ? "bg-success/15 text-success" : "bg-recess text-ink-3"}`}>
                  🌅 {d.manhaLivre ? "livre" : "ocupada"}
                </span>
                <span className={`rounded px-1 py-0.5 text-caps ${d.tardeLivre ? "bg-success/15 text-success" : "bg-recess text-ink-3"}`}>
                  🌆 {d.tardeLivre ? "livre" : "ocupada"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {estagio.mensagens.length > 0 && (
        <div className="mt-4 flex flex-col gap-1.5 border-t border-hairline pt-3">
          {estagio.mensagens.map((m, i) => (
            <p key={i} className="text-label text-ink-2">
              {m.texto}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
