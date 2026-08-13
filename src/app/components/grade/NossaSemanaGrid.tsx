"use client";

import { useState } from "react";
import { SegmentedControl } from "@/app/components/ui/SegmentedControl";
import { SharedWeekGrid } from "@/app/components/grade/SharedWeekGrid";
import { Pessoa, JanelaComum } from "@/lib/nossaSemana";

interface NossaSemanaGridProps {
  eu: Pessoa;
  colega: Pessoa;
  janelasComuns: JanelaComum[];
}

export function NossaSemanaGrid({ eu, colega, janelasComuns }: NossaSemanaGridProps) {
  const [modo, setModo] = useState<"completa" | "livres">("completa");

  return (
    <div>
      <div className="mb-3">
        <SegmentedControl
          options={[
            { value: "completa", label: "Grade completa" },
            { value: "livres", label: "Só janelas livres" },
          ]}
          value={modo}
          onChange={(v) => setModo(v as "completa" | "livres")}
        />
      </div>
      <SharedWeekGrid eu={eu} colega={colega} janelasComuns={janelasComuns} soLivres={modo === "livres"} />
    </div>
  );
}
