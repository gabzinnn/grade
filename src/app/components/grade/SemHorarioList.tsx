import { DisciplinaBlockTrigger } from "@/app/components/grade/DisciplinaBlockTrigger";
import { tintClaro } from "@/lib/cor";

export interface SemHorarioItem {
  disciplinaId: number;
  codigo: string;
  nome: string;
  creditos: number;
  corCategoria: string;
  corDisciplina: string;
}

interface SemHorarioListProps {
  itens: SemHorarioItem[];
  planoPeriodoId: number;
}

export function SemHorarioList({ itens, planoPeriodoId }: SemHorarioListProps) {
  if (itens.length === 0) return null;

  return (
    <div className="rounded-card border border-hairline bg-surface p-4">
      <p className="mb-2 text-label text-ink-2">Sem horário fixo — contam créditos, não ocupam o calendário:</p>
      <div className="flex flex-wrap gap-2">
        {itens.map((item) => (
          <DisciplinaBlockTrigger
            key={item.disciplinaId}
            disciplinaId={item.disciplinaId}
            planoPeriodoId={planoPeriodoId}
            className="flex items-center gap-2 rounded-chip border px-3 py-1.5"
            style={{ borderColor: `${item.corCategoria}88`, backgroundColor: tintClaro(item.corDisciplina, 0.75) }}
          >
            <span className="text-caps font-semibold" style={{ color: item.corDisciplina }}>
              {item.codigo}
            </span>
            <span className="text-body-sm text-ink">{item.nome}</span>
            <span className="text-caps text-ink-3">{item.creditos} cr</span>
          </DisciplinaBlockTrigger>
        ))}
      </div>
    </div>
  );
}
