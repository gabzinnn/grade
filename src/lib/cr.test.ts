import { describe, it, expect } from "vitest";
import { acumularCR, mediaNecessaria } from "./cr";

describe("acumularCR", () => {
  it("pondera por créditos, conta reprovada e ignora trancada/dispensada/sem nota", () => {
    const out = acumularCR([
      { status: "CONCLUIDA", nota: 8, creditos: 4 },
      { status: "REPROVADA", nota: 2, creditos: 2 },
      { status: "TRANCADA", nota: null, creditos: 4 },
      { status: "DISPENSADA", nota: 10, creditos: 4 },
      { status: "CONCLUIDA", nota: null, creditos: 4 },
    ]);
    expect(out.creditos).toBe(6);
    expect(out.cr).toBe(6);
  });

  it("sem itens válidos → cr null", () => {
    expect(acumularCR([]).cr).toBeNull();
  });
});

describe("mediaNecessaria", () => {
  it("calcula a média que falta", () => {
    // 6.0 em 6 créditos; alvo 7 com mais 6 créditos → precisa 8
    expect(mediaNecessaria({ soma: 36, creditos: 6 }, 7, 6)).toBe(8);
  });
  it("meta impossível passa de 10; sem créditos futuros → null", () => {
    expect(mediaNecessaria({ soma: 0, creditos: 100 }, 9, 10)!).toBeGreaterThan(10);
    expect(mediaNecessaria({ soma: 36, creditos: 6 }, 7, 0)).toBeNull();
  });
});
