import Link from "next/link";
import { LinkPendingOverlay } from "@/app/components/ui/LinkPendingOverlay";

export interface PeriodoTabData {
  ordem: number;
  encerrado: boolean;
  creditos: number;
  tetoCreditos: number;
  temChoque: boolean;
  semestreLabel?: string;
}

interface PeriodoTabsProps {
  periodos: PeriodoTabData[];
  ordemAtiva: number;
}

export function PeriodoTabs({ periodos, ordemAtiva }: PeriodoTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {periodos.map((p) => {
        const ativo = p.ordem === ordemAtiva;
        const acimaDoTeto = p.creditos > p.tetoCreditos;
        return (
          <Link
            key={p.ordem}
            href={`?periodo=${p.ordem}`}
            aria-current={ativo ? "true" : undefined}
            className={`relative flex min-w-[76px] flex-col items-center gap-0.5 rounded-t-[10px] border px-3 pb-2 pt-2 ${
              ativo ? "border-primary bg-primary text-raised" : "border-hairline bg-recess text-ink-2 hover:bg-hairline/40"
            }`}
          >
            {acimaDoTeto && (
              <span className="absolute -top-2 right-1 rounded-chip bg-danger px-1.5 py-0.5 text-caps font-semibold text-raised">
                {p.creditos} cr
              </span>
            )}
            <span className={`flex items-center gap-1 font-data text-body-sm font-semibold ${ativo ? "text-raised" : "text-ink"}`}>
              {p.ordem}º{p.temChoque && <span title="Choque de horário">⚠</span>}
            </span>
            {p.semestreLabel && (
              <span className={`text-caps ${ativo ? "text-raised/80" : "text-ink-3"}`}>{p.semestreLabel}</span>
            )}
            <span className={`text-caps ${ativo ? "text-raised/90" : "text-ink-2"}`}>{p.creditos} cr</span>
            {p.encerrado && (
              <span className={`text-caps uppercase tracking-wide ${ativo ? "text-raised/70" : "text-ink-3"}`}>Encerrado</span>
            )}
            <LinkPendingOverlay />
          </Link>
        );
      })}
    </div>
  );
}
