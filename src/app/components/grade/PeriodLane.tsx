import Link from "next/link";
import { CourseBlock } from "@/app/components/grade/CourseBlock";
import { IconGrid } from "@/app/components/ui/icons";
import { DisciplinaPrefetchLink } from "@/app/components/grade/DisciplinaPrefetchLink";
import { FecharPeriodoButton } from "@/app/components/grade/FecharPeriodoButton";

export type EstadoPeriodo = "CONCLUIDO" | "ATUAL" | "FUTURO";

interface PeriodLaneItem {
  disciplinaId: number;
  codigo: string;
  nome: string;
  corCategoria: string;
  corDisciplina: string;
  sala?: string;
  nota?: number;
  reprovada?: boolean;
}

interface PeriodLaneProps {
  id: number;
  ordem: number;
  label: string;
  creditos: number;
  tetoCreditos: number;
  estado: EstadoPeriodo;
  itens: PeriodLaneItem[];
}

const CABECALHO_POR_ESTADO: Record<EstadoPeriodo, string> = {
  CONCLUIDO: "bg-recess opacity-75",
  ATUAL: "bg-primary/12",
  FUTURO: "bg-recess/60",
};

export function PeriodLane({ id, ordem, label, creditos, tetoCreditos, estado, itens }: PeriodLaneProps) {
  return (
    <div className="flex w-[280px] shrink-0 flex-col snap-start">
      <div className={`flex items-center justify-between rounded-t-card border border-b-0 border-hairline px-3 py-2.5 ${CABECALHO_POR_ESTADO[estado]}`}>
        <span className="text-caps text-ink">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-data text-label text-ink-2">{creditos} cred</span>
          {estado === "ATUAL" && <FecharPeriodoButton planoPeriodoId={id} itens={itens} />}
        </div>
      </div>
      <div className="flex min-h-[240px] flex-col gap-2 rounded-b-card border border-t-0 border-hairline bg-surface p-3">
        {itens.map((item) =>
          estado === "CONCLUIDO" ? (
            <CourseBlock
              key={item.disciplinaId}
              codigo={item.codigo}
              nome={item.nome}
              corCategoria={item.corCategoria}
              corDisciplina={item.corDisciplina}
              estado={estado}
              nota={item.nota}
              reprovada={item.reprovada}
            />
          ) : (
            <DisciplinaPrefetchLink
              key={item.disciplinaId}
              href={`/planejador?periodo=${ordem}&disciplina=${item.disciplinaId}`}
              disciplinaId={item.disciplinaId}
              planoPeriodoId={id}
              className="block"
            >
              <CourseBlock
                codigo={item.codigo}
                nome={item.nome}
                corCategoria={item.corCategoria}
                corDisciplina={item.corDisciplina}
                estado={estado}
                sala={item.sala}
                className="transition-shadow hover:shadow-resting"
              />
            </DisciplinaPrefetchLink>
          ),
        )}
        {estado !== "CONCLUIDO" && creditos < tetoCreditos && (
          <Link
            href={`/planejador?periodo=${ordem}`}
            className="relative mt-1 flex h-20 flex-col items-center justify-center gap-1 rounded-block border border-dashed border-hairline bg-recess/50 text-ink-2 transition-colors hover:border-primary/50"
          >
            <IconGrid className="h-4 w-4" />
            <span className="text-caps">Alocar créditos</span>
          </Link>
        )}
      </div>
    </div>
  );
}
