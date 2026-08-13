import { describe, expect, it } from "vitest";
import {
  cargaPorDia,
  choque,
  creditosDoPeriodo,
  diasPresenciais,
  janelasEmComum,
  janelasLivres,
  layoutColunas,
  turnoDe,
} from "./schedule";

describe("choque", () => {
  it("não é choque quando um termina exatamente onde o outro começa", () => {
    expect(
      choque({ diaSemana: 2, inicioMin: 480, fimMin: 660 }, { diaSemana: 2, inicioMin: 660, fimMin: 720 }),
    ).toBe(false);
  });

  it("é choque quando os intervalos se sobrepõem de verdade", () => {
    expect(
      choque({ diaSemana: 2, inicioMin: 480, fimMin: 660 }, { diaSemana: 2, inicioMin: 600, fimMin: 720 }),
    ).toBe(true);
  });

  it("nunca é choque em dias diferentes", () => {
    expect(
      choque({ diaSemana: 2, inicioMin: 480, fimMin: 660 }, { diaSemana: 3, inicioMin: 480, fimMin: 660 }),
    ).toBe(false);
  });
});

describe("diasPresenciais", () => {
  it("conta dias únicos, não itens", () => {
    expect(
      diasPresenciais([
        { diaSemana: 2, inicioMin: 480, fimMin: 600 },
        { diaSemana: 2, inicioMin: 600, fimMin: 720 },
        { diaSemana: 4, inicioMin: 480, fimMin: 600 },
      ]),
    ).toBe(2);
  });
});

describe("cargaPorDia", () => {
  it("soma minutos por dia", () => {
    expect(
      cargaPorDia([
        { diaSemana: 2, inicioMin: 480, fimMin: 600 },
        { diaSemana: 2, inicioMin: 600, fimMin: 660 },
      ]),
    ).toEqual({ 2: 180 });
  });
});

describe("creditosDoPeriodo", () => {
  it("soma créditos dos itens", () => {
    expect(creditosDoPeriodo([{ creditos: 4 }, { creditos: 6 }])).toBe(10);
  });
});

describe("janelasLivres", () => {
  it("preenche o dia inteiro quando não há ocupação", () => {
    const livres = janelasLivres([]);
    expect(livres).toHaveLength(5);
    expect(livres[0]).toEqual({ diaSemana: 1, inicioMin: 420, fimMin: 1260 });
  });

  it("recorta em volta de um intervalo ocupado no meio do dia", () => {
    const livres = janelasLivres([{ diaSemana: 2, inicioMin: 600, fimMin: 660 }]);
    const doTerca = livres.filter((l) => l.diaSemana === 2);
    expect(doTerca).toEqual([
      { diaSemana: 2, inicioMin: 420, fimMin: 600 },
      { diaSemana: 2, inicioMin: 660, fimMin: 1260 },
    ]);
  });

  it("mescla ocupações sobrepostas ou adjacentes", () => {
    const doDia = janelasLivres([
      { diaSemana: 3, inicioMin: 480, fimMin: 600 },
      { diaSemana: 3, inicioMin: 550, fimMin: 660 },
    ]).filter((l) => l.diaSemana === 3);
    expect(doDia).toEqual([
      { diaSemana: 3, inicioMin: 420, fimMin: 480 },
      { diaSemana: 3, inicioMin: 660, fimMin: 1260 },
    ]);
  });
});

describe("janelasEmComum", () => {
  it("só sobra o horário livre pras duas pessoas ao mesmo tempo", () => {
    const comuns = janelasEmComum(
      [{ diaSemana: 1, inicioMin: 420, fimMin: 600 }],
      [{ diaSemana: 1, inicioMin: 900, fimMin: 1260 }],
    ).filter((l) => l.diaSemana === 1);
    expect(comuns).toEqual([{ diaSemana: 1, inicioMin: 600, fimMin: 900 }]);
  });
});

describe("layoutColunas", () => {
  it("dá uma coluna só pra itens que não se sobrepõem", () => {
    const out = layoutColunas([
      { diaSemana: 2, inicioMin: 480, fimMin: 600 },
      { diaSemana: 2, inicioMin: 600, fimMin: 720 },
    ]);
    expect(out.map((o) => ({ col: o.col, ncols: o.ncols }))).toEqual([
      { col: 0, ncols: 1 },
      { col: 0, ncols: 1 },
    ]);
  });

  it("separa em colunas itens que colidem", () => {
    const out = layoutColunas([
      { diaSemana: 2, inicioMin: 480, fimMin: 600 },
      { diaSemana: 2, inicioMin: 540, fimMin: 660 },
    ]);
    expect(out.map((o) => ({ col: o.col, ncols: o.ncols }))).toEqual([
      { col: 0, ncols: 2 },
      { col: 1, ncols: 2 },
    ]);
  });

  it("reaproveita coluna liberada por um item que já terminou", () => {
    const out = layoutColunas([
      { diaSemana: 2, inicioMin: 480, fimMin: 540 },
      { diaSemana: 2, inicioMin: 500, fimMin: 620 },
      { diaSemana: 2, inicioMin: 550, fimMin: 600 },
    ]);
    expect(out.map((o) => o.col)).toEqual([0, 1, 0]);
    expect(out.every((o) => o.ncols === 2)).toBe(true);
  });
});

describe("turnoDe", () => {
  it("classifica manhã, tarde e noite nas fronteiras", () => {
    expect(turnoDe(0)).toBe("manha");
    expect(turnoDe(719)).toBe("manha");
    expect(turnoDe(720)).toBe("tarde");
    expect(turnoDe(1079)).toBe("tarde");
    expect(turnoDe(1080)).toBe("noite");
  });
});
