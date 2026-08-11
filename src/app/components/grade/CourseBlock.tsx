interface CourseBlockProps {
  codigo: string;
  nome: string;
  corCategoria: string;
  estado: "CONCLUIDO" | "ATUAL" | "FUTURO";
  sala?: string;
  nota?: number;
  reprovada?: boolean;
}

export function CourseBlock({ codigo, nome, corCategoria, estado, sala, nota, reprovada }: CourseBlockProps) {
  if (estado === "CONCLUIDO") {
    return (
      <div
        className={`rounded-block px-3 py-2 opacity-70 ${reprovada ? "border border-danger" : ""}`}
        style={{ backgroundColor: `${corCategoria}2E` }}
      >
        <p className="text-body-sm text-ink">{nome}</p>
        <p className={`text-caps ${reprovada ? "text-danger" : "text-ink-2"}`}>
          {codigo}
          {typeof nota === "number" ? ` · ${nota.toFixed(1)}` : ""}
        </p>
      </div>
    );
  }

  if (estado === "ATUAL") {
    return (
      <div
        className="rounded-block px-3 py-2 ring-1 ring-primary bg-raised"
        style={{ borderLeft: `3px solid ${corCategoria}` }}
      >
        <span className="inline-block mb-1 text-caps text-primary">Em curso</span>
        <p className="text-body-sm text-ink">{nome}</p>
        <p className="text-caps text-ink-2">
          {codigo}
          {sala ? ` · ${sala}` : ""}
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-block px-3 py-2 border border-dashed bg-transparent"
      style={{ borderColor: corCategoria }}
    >
      <p className="text-body-sm text-ink">{nome}</p>
      <p className="text-caps text-ink-2">{codigo}</p>
    </div>
  );
}
