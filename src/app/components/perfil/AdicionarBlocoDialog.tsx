"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/app/components/ui/Dialog";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { criarBloco } from "@/actions/perfil";

const DIAS = [
  { valor: 1, label: "Segunda" },
  { valor: 2, label: "Terça" },
  { valor: 3, label: "Quarta" },
  { valor: 4, label: "Quinta" },
  { valor: 5, label: "Sexta" },
  { valor: 6, label: "Sábado" },
];

const TIPOS = [
  { valor: "ESTAGIO", label: "Estágio" },
  { valor: "TRABALHO", label: "Trabalho" },
  { valor: "PESSOAL", label: "Pessoal" },
  { valor: "DESLOCAMENTO", label: "Deslocamento" },
] as const;

function minutosDoHorario(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

interface AdicionarBlocoDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AdicionarBlocoDialog({ open, onClose }: AdicionarBlocoDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]["valor"]>("PESSOAL");
  const [diaSemana, setDiaSemana] = useState(1);
  const [inicio, setInicio] = useState("08:00");
  const [fim, setFim] = useState("10:00");
  const [erro, setErro] = useState<string | null>(null);

  function salvar() {
    setErro(null);
    startTransition(async () => {
      try {
        await criarBloco({
          titulo,
          tipo,
          diaSemana,
          inicioMin: minutosDoHorario(inicio),
          fimMin: minutosDoHorario(fim),
        });
        router.refresh();
        setTitulo("");
        onClose();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível salvar");
      }
    });
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <h3 className="mb-4 text-body font-semibold text-ink">Adicionar horário fixo</h3>
      <div className="flex flex-col gap-3">
        <Input placeholder="Título (ex.: TechCorp Inc.)" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <Select value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)}>
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.label}
            </option>
          ))}
        </Select>
        <Select value={diaSemana} onChange={(e) => setDiaSemana(Number(e.target.value))}>
          {DIAS.map((d) => (
            <option key={d.valor} value={d.valor}>
              {d.label}
            </option>
          ))}
        </Select>
        <div className="flex items-center gap-2">
          <Input type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} className="flex-1" />
          <span className="text-ink-2">até</span>
          <Input type="time" value={fim} onChange={(e) => setFim(e.target.value)} className="flex-1" />
        </div>
        {erro && <p className="text-label text-danger">{erro}</p>}
      </div>
      <div className="mt-5 flex gap-3">
        <Button variant="secondary" type="button" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="button" className="flex-1" disabled={!titulo || pending} onClick={salvar}>
          {pending ? "Salvando..." : "Adicionar"}
        </Button>
      </div>
    </Dialog>
  );
}
