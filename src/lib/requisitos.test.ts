import { describe, expect, it } from "vitest";
import { creditosPorCategoria, prerequisitosCumpridos, progressaoCumulativa } from "./requisitos";

describe("creditosPorCategoria", () => {
  it("separa obtidos (histórico) de planejados (plano) por categoria", () => {
    const resultado = creditosPorCategoria(
      [
        { categoriaChave: "OBRIGATORIA", creditos: 4, origem: "historico" },
        { categoriaChave: "OBRIGATORIA", creditos: 6, origem: "plano" },
        { categoriaChave: "HUMANAS", creditos: 2, origem: "historico" },
      ],
      new Map([
        ["OBRIGATORIA", 200],
        ["HUMANAS", null],
      ]),
    );

    expect(resultado).toContainEqual({ categoriaChave: "OBRIGATORIA", obtidos: 4, planejados: 6, meta: 200 });
    expect(resultado).toContainEqual({ categoriaChave: "HUMANAS", obtidos: 2, planejados: 0, meta: null });
  });
});

describe("progressaoCumulativa", () => {
  it("acumula créditos período a período", () => {
    const resultado = progressaoCumulativa([
      { ordem: 1, obrigatorias: 10, eletivas: 2 },
      { ordem: 2, obrigatorias: 8, eletivas: 4 },
    ]);

    expect(resultado).toEqual([
      { ordem: 1, obrigatoriasAcumuladas: 10, eletivasAcumuladas: 2 },
      { ordem: 2, obrigatoriasAcumuladas: 18, eletivasAcumuladas: 6 },
    ]);
  });
});

describe("prerequisitosCumpridos", () => {
  it("ignora requisitos de tipo CO", () => {
    expect(
      prerequisitosCumpridos([{ disciplinaExigidaId: 2, tipo: "CO" }], new Set()),
    ).toBe(true);
  });

  it("exige todos os PRE presentes no conjunto de cursáveis", () => {
    const cursaveis = new Set([1]);
    expect(
      prerequisitosCumpridos(
        [
          { disciplinaExigidaId: 1, tipo: "PRE" },
          { disciplinaExigidaId: 2, tipo: "PRE" },
        ],
        cursaveis,
      ),
    ).toBe(false);
  });
});
