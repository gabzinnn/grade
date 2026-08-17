"use client";

import { createContext, ReactNode, useContext, useState } from "react";

export interface DisciplinaAlvo {
  disciplinaId: number;
  planoPeriodoId: number;
  /** Período já encerrado: PlanoItem é imutável no banco (trigger), então só a edição de dados do catálogo fica disponível. */
  somenteLeitura?: boolean;
}

interface DisciplinaDetalheState {
  alvo: DisciplinaAlvo | null;
  abrir: (alvo: DisciplinaAlvo) => void;
  fechar: () => void;
}

const DisciplinaDetalheContext = createContext<DisciplinaDetalheState | null>(null);

export function DisciplinaDetalheProvider({
  children,
  inicial = null,
}: {
  children: ReactNode;
  inicial?: DisciplinaAlvo | null;
}) {
  const [alvo, setAlvo] = useState<DisciplinaAlvo | null>(inicial);
  return (
    <DisciplinaDetalheContext.Provider value={{ alvo, abrir: setAlvo, fechar: () => setAlvo(null) }}>
      {children}
    </DisciplinaDetalheContext.Provider>
  );
}

export function useDisciplinaDetalheContext(): DisciplinaDetalheState {
  const ctx = useContext(DisciplinaDetalheContext);
  if (!ctx) throw new Error("useDisciplinaDetalheContext precisa estar dentro de DisciplinaDetalheProvider");
  return ctx;
}
