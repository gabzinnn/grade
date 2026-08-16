import { CourseBlock } from "@/app/components/grade/CourseBlock";
import { corPorDisciplina } from "@/lib/cor";
import { Pessoa, BlocoPessoa, JanelaComum } from "@/lib/nossaSemana";

const DIAS = [
  { diaSemana: 1, label: "Seg" },
  { diaSemana: 2, label: "Ter" },
  { diaSemana: 3, label: "Qua" },
  { diaSemana: 4, label: "Qui" },
  { diaSemana: 5, label: "Sex" },
];

const HORA_INICIO = 7;
const HORA_FIM = 21;

/** Cor de cada pessoa — fica na borda do bloco, já que o fundo agora é a cor da
 * disciplina. A legenda em nossa-semana/page.tsx usa as mesmas constantes. */
export const COR_EU = "#2F6F8F";
export const COR_COLEGA = "#9B3F73";

interface SharedWeekGridProps {
  eu: Pessoa;
  colega: Pessoa;
  janelasComuns: JanelaComum[];
  soLivres: boolean;
}

/** Mesma linguagem visual do Planejador: cor própria por disciplina no fundo
 * (corPorDisciplina + tint) e a cor da pessoa na borda, que é o que diz de quem
 * é o bloco. Compromisso pessoal não tem disciplina, então fica neutro. */
function Bloco({
  bloco,
  top,
  height,
  corPessoa,
  lado,
}: {
  bloco: BlocoPessoa;
  top: number;
  height: number;
  corPessoa: string;
  lado: "left" | "right";
}) {
  const posicao = `absolute z-[5] w-[calc(50%-4px)] ${lado === "left" ? "left-1" : "right-1"}`;

  if (!bloco.codigo) {
    return (
      <div
        className={`${posicao} overflow-hidden rounded-block bg-raised px-2 py-1.5 shadow-resting`}
        style={{ top, height, borderLeft: `3px solid ${corPessoa}` }}
      >
        <p className="line-clamp-2 text-caps text-ink-2">{bloco.titulo}</p>
      </div>
    );
  }

  return (
    <div
      className={`${posicao} overflow-hidden rounded-block shadow-resting`}
      style={{ top, height, borderLeft: `3px solid ${corPessoa}` }}
    >
      <CourseBlock
        codigo={bloco.codigo}
        nome={bloco.titulo}
        corCategoria={corPessoa}
        corDisciplina={corPorDisciplina(String(bloco.disciplinaId))}
        estado="FUTURO"
        className="h-full rounded-none border-0"
      />
    </div>
  );
}

export function SharedWeekGrid({ eu, colega, janelasComuns, soLivres }: SharedWeekGridProps) {
  const alturaTotal = (HORA_FIM - HORA_INICIO) * 60;
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
              {janelasComuns
                .filter((j) => j.diaSemana === d.diaSemana)
                .map((j, i) => (
                  <div
                    key={i}
                    className="absolute inset-x-1 z-10 flex flex-col items-center justify-center gap-0.5 rounded-block border-l-[3px] border-success bg-success/15 text-center"
                    style={{ top: (j.inicioMin - HORA_INICIO * 60), height: j.fimMin - j.inicioMin }}
                  >
                    <span className="text-body-sm font-medium text-ink">Janela comum</span>
                    <span className="text-caps text-ink-2">
                      {Math.floor(j.inicioMin / 60)}h - {Math.floor(j.fimMin / 60)}h ({(j.minutos / 60).toFixed(1)}h)
                    </span>
                  </div>
                ))}

              {!soLivres &&
                eu.blocos
                  .filter((b) => b.diaSemana === d.diaSemana)
                  .map((b, i) => (
                    <Bloco
                      key={`eu-${i}`}
                      lado="left"
                      bloco={b}
                      top={b.inicioMin - HORA_INICIO * 60}
                      height={b.fimMin - b.inicioMin}
                      corPessoa={COR_EU}
                    />
                  ))}
              {!soLivres &&
                colega.blocos
                  .filter((b) => b.diaSemana === d.diaSemana)
                  .map((b, i) => (
                    <Bloco
                      key={`colega-${i}`}
                      lado="right"
                      bloco={b}
                      top={b.inicioMin - HORA_INICIO * 60}
                      height={b.fimMin - b.inicioMin}
                      corPessoa={COR_COLEGA}
                    />
                  ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
