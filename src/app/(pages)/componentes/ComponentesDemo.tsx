"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Chip } from "@/app/components/ui/Chip";
import { SegmentedControl } from "@/app/components/ui/SegmentedControl";
import { Dialog } from "@/app/components/ui/Dialog";
import { SlideOver } from "@/app/components/ui/SlideOver";

export function ComponentesDemo() {
  const [segmento, setSegmento] = useState("grade");
  const [chipAtivo, setChipAtivo] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [slideAberto, setSlideAberto] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setDialogAberto(true)}>Abrir diálogo</Button>
        <Button variant="secondary" onClick={() => setSlideAberto(true)}>
          Abrir painel lateral
        </Button>
        <Chip active={chipAtivo} onClick={() => setChipAtivo((v) => !v)} className="cursor-pointer">
          {chipAtivo ? "Ativo" : "Inativo"}
        </Chip>
        <SegmentedControl
          value={segmento}
          onChange={setSegmento}
          options={[
            { value: "grade", label: "Grade completa" },
            { value: "livre", label: "Só janelas livres" },
          ]}
        />
      </div>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)}>
        <h2 className="mb-2 text-body font-semibold text-ink">Diálogo de exemplo</h2>
        <p className="mb-4 text-body-sm text-ink-2">Raio de 20px, sombra floating, fundo surface.</p>
        <Button onClick={() => setDialogAberto(false)}>Fechar</Button>
      </Dialog>

      <SlideOver open={slideAberto} onClose={() => setSlideAberto(false)}>
        <h2 className="mb-2 text-body font-semibold text-ink">Painel lateral de exemplo</h2>
        <p className="mb-4 text-body-sm text-ink-2">Ancorado à direita, altura cheia.</p>
        <Button onClick={() => setSlideAberto(false)}>Fechar</Button>
      </SlideOver>
    </div>
  );
}
