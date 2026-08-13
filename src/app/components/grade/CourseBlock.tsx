import { tintClaro } from "@/lib/cor";

interface CourseBlockProps {
  codigo: string;
  nome: string;
  corCategoria: string;
  corDisciplina: string;
  estado: "CONCLUIDO" | "ATUAL" | "FUTURO";
  sala?: string;
  nota?: number;
  reprovada?: boolean;
  className?: string;
}

export function CourseBlock({
  codigo,
  nome,
  corCategoria,
  corDisciplina,
  estado,
  sala,
  nota,
  reprovada,
  className = "",
}: CourseBlockProps) {
  if (estado === "CONCLUIDO") {
    return (
      <div
        className={`rounded-block px-3 py-2 opacity-70 border ${reprovada ? "border-danger" : ""} ${className}`}
        style={{ backgroundColor: tintClaro(corDisciplina, 0.72), borderColor: reprovada ? undefined : corCategoria }}
      >
        <p className="text-body-sm text-ink">{nome}</p>
        <p className={`text-caps font-semibold ${reprovada ? "text-danger" : ""}`} style={reprovada ? undefined : { color: corDisciplina }}>
          {codigo}
          {typeof nota === "number" ? ` · ${nota.toFixed(1)}` : ""}
        </p>
      </div>
    );
  }

  if (estado === "ATUAL") {
    return (
      <div
        className={`rounded-block border-2 px-3 py-2 ${className}`}
        style={{ borderColor: corCategoria, backgroundColor: tintClaro(corDisciplina, 0.65) }}
      >
        <span className="inline-block mb-1 text-caps text-primary">Em curso</span>
        <p className="text-body-sm text-ink">{nome}</p>
        <p className="text-caps font-semibold" style={{ color: corDisciplina }}>
          {codigo}
          {sala ? ` · ${sala}` : ""}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-block border px-3 py-2 ${className}`}
      style={{ borderColor: `${corCategoria}88`, backgroundColor: tintClaro(corDisciplina, 0.75) }}
    >
      <p className="text-body-sm text-ink">{nome}</p>
      <p className="text-caps font-semibold" style={{ color: corDisciplina }}>
        {codigo}
      </p>
    </div>
  );
}
