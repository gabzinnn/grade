import { AppShell } from "@/app/components/AppShell";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { ProgressBar } from "@/app/components/ui/ProgressBar";
import { Avatar } from "@/app/components/ui/Avatar";
import { CourseBlock } from "@/app/components/grade/CourseBlock";
import { ComponentesDemo } from "./ComponentesDemo";

const CORES = [
  { nome: "canvas", classe: "bg-canvas" },
  { nome: "surface", classe: "bg-surface" },
  { nome: "raised", classe: "bg-raised" },
  { nome: "recess", classe: "bg-recess" },
  { nome: "primary", classe: "bg-primary" },
  { nome: "success", classe: "bg-success" },
  { nome: "warn", classe: "bg-warn" },
  { nome: "danger", classe: "bg-danger" },
];

const CATEGORIAS = ["#2F6F8F", "#2E8B6A", "#5B53A6", "#9B3F73", "#6E7B3F", "#7A7367"];

export default function ComponentesPage() {
  return (
    <AppShell title="Componentes" subtitulo="Folha de referência viva dos primitivos de ui/">
      <div className="flex flex-col gap-5">
        <Card>
          <h2 className="mb-4 text-body font-semibold text-ink">Cores</h2>
          <div className="flex flex-wrap gap-4">
            {CORES.map((c) => (
              <div key={c.nome} className="flex flex-col items-center gap-2">
                <div className={`h-12 w-12 rounded-block border border-hairline ${c.classe}`} />
                <span className="text-caps text-ink-2">{c.nome}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {CATEGORIAS.map((cor) => (
              <div
                key={cor}
                className="h-8 w-16 rounded-block"
                style={{ backgroundColor: `${cor}1A`, borderLeft: `3px solid ${cor}` }}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-body font-semibold text-ink">Tipografia</h2>
          <div className="flex flex-col gap-2">
            <p className="text-title text-ink">Título 26px</p>
            <p className="text-body text-ink">Corpo 16px</p>
            <p className="text-body-sm text-ink">Corpo pequeno 14px</p>
            <p className="text-label text-ink-2">Rótulo 13px</p>
            <p className="text-caps uppercase tracking-[0.06em] text-ink-3">Rótulo maiúsculo 11px</p>
            <p className="font-data text-body text-ink">1234567890 — Roboto Condensed tabular</p>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-body font-semibold text-ink">Controles</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Input placeholder="Campo de texto" className="w-56" />
            <Select className="w-40">
              <option>Opção A</option>
              <option>Opção B</option>
            </Select>
            <Avatar nome="Gabriel" />
            <div className="w-40">
              <ProgressBar value={68} max={120} />
            </div>
          </div>
          <div className="mt-4">
            <ComponentesDemo />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-body font-semibold text-ink">Estados de CourseBlock</h2>
          <div className="grid grid-cols-3 gap-3">
            <CourseBlock codigo="EEI541" nome="Pesquisa Operacional I" corCategoria="#2F6F8F" estado="CONCLUIDO" nota={8.2} />
            <CourseBlock codigo="MAT101" nome="Cálculo I" corCategoria="#C4443A" estado="CONCLUIDO" nota={3.5} reprovada />
            <CourseBlock codigo="EEI643" nome="Pesquisa Operacional I" corCategoria="#5B53A6" estado="ATUAL" sala="Sala 204" />
            <CourseBlock codigo="EEI714" nome="Simulação Discreta" corCategoria="#2E8B6A" estado="FUTURO" />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
