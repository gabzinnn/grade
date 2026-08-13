import { CourseBlock } from "@/app/components/grade/CourseBlock";
import { DisciplinaBlockTrigger } from "@/app/components/grade/DisciplinaBlockTrigger";
import { layoutColunas } from "@/lib/schedule";

export interface WeekGridItem {
  id: string;
  disciplinaId: number;
  diaSemana: number;
  inicioMin: number;
  fimMin: number;
  codigo: string;
  nome: string;
  corCategoria: string;
  corDisciplina: string;
  sala?: string;
  temChoque: boolean;
  estado: "CONCLUIDO" | "ATUAL" | "FUTURO";
}

const DIAS = [
  { diaSemana: 1, label: "Seg" },
  { diaSemana: 2, label: "Ter" },
  { diaSemana: 3, label: "Qua" },
  { diaSemana: 4, label: "Qui" },
  { diaSemana: 5, label: "Sex" },
];

const HORA_INICIO = 7;
const HORA_FIM = 21;
const PX_POR_MIN = 1;

interface WeekGridProps {
  itens: WeekGridItem[];
  planoPeriodoId: number;
}

export function WeekGrid({ itens, planoPeriodoId }: WeekGridProps) {
  const alturaTotal = (HORA_FIM - HORA_INICIO) * 60 * PX_POR_MIN;
  const horas = Array.from({ length: HORA_FIM - HORA_INICIO + 1 }, (_, i) => HORA_INICIO + i);

  return (
    <div className="flex rounded-card border border-hairline bg-surface">
      <div className="w-14 shrink-0 border-r border-hairline bg-recess">
        <div className="h-12 border-b border-hairline" />
        {horas.map((h) => (
          <div key={h} className="flex h-[60px] items-start justify-center pt-1">
            <span className="font-data text-caps text-ink-3">{String(h).padStart(2, "0")}:00</span>
          </div>
        ))}
      </div>

      <div className="flex-1">
        <div className="grid h-12 grid-cols-5 divide-x divide-hairline border-b border-hairline bg-recess text-center">
          {DIAS.map((d) => (
            <div key={d.diaSemana} className="flex items-center justify-center text-body-sm text-ink-2">
              {d.label}
            </div>
          ))}
        </div>

        <div
          className="grid grid-cols-5 divide-x divide-hairline bg-[linear-gradient(to_bottom,var(--color-hairline)_1px,transparent_1px)] bg-[length:100%_60px]"
          style={{ height: alturaTotal }}
        >
          {DIAS.map((d) => (
            <div key={d.diaSemana} className="relative">
              {layoutColunas(itens.filter((i) => i.diaSemana === d.diaSemana)).map((item) => (
                  <div
                    key={item.id}
                    className="absolute"
                    style={{
                      top: (item.inicioMin - HORA_INICIO * 60) * PX_POR_MIN,
                      height: (item.fimMin - item.inicioMin) * PX_POR_MIN,
                      left: `calc(${(100 / item.ncols) * item.col}% + 4px)`,
                      width: `calc(${100 / item.ncols}% - 8px)`,
                    }}
                  >
                    {item.estado === "CONCLUIDO" ? (
                      <CourseBlock
                        codigo={item.codigo}
                        nome={item.nome}
                        corCategoria={item.temChoque ? "#C4443A" : item.corCategoria}
                        corDisciplina={item.corDisciplina}
                        estado={item.estado}
                        sala={item.sala}
                        className="h-full overflow-hidden shadow-resting"
                      />
                    ) : (
                      <DisciplinaBlockTrigger
                        disciplinaId={item.disciplinaId}
                        planoPeriodoId={planoPeriodoId}
                        className="h-full"
                      >
                        <CourseBlock
                          codigo={item.codigo}
                          nome={item.nome}
                          corCategoria={item.temChoque ? "#C4443A" : item.corCategoria}
                          corDisciplina={item.corDisciplina}
                          estado={item.estado}
                          sala={item.sala}
                          className="h-full overflow-hidden shadow-resting transition-shadow hover:shadow-floating"
                        />
                      </DisciplinaBlockTrigger>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
