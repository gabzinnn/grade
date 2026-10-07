import { describe, expect, it } from "vitest";
import { construirEstagioTurnos, tetoComEstagio } from "./estagio";

describe("construirEstagioTurnos", () => {
  it("dá score 5 quando todo dia tem manhã ou tarde livre", () => {
    const out = construirEstagioTurnos([
      { nome: "EEI613", horarios: [{ diaSemana: 1, inicioMin: 420, fimMin: 540 }] }, // manhã de segunda ocupada, tarde livre
    ]);
    expect(out.score).toBe(5);
    expect(out.dias.find((d) => d.diaSemana === 1)).toEqual({ diaSemana: 1, manhaLivre: false, tardeLivre: true, aproveitavel: true });
    expect(out.mensagens).toEqual([]);
  });

  it("marca um dia como não aproveitável quando manhã e tarde estão ocupadas", () => {
    const out = construirEstagioTurnos([
      { nome: "EEI613", horarios: [{ diaSemana: 2, inicioMin: 420, fimMin: 540 }] },
      { nome: "EEI621", horarios: [{ diaSemana: 2, inicioMin: 840, fimMin: 960 }] },
    ]);
    expect(out.score).toBe(4);
    const terca = out.dias.find((d) => d.diaSemana === 2)!;
    expect(terca.aproveitavel).toBe(false);
  });

  it("aponta o turno mais barato de liberar (menos matérias) e nomeia as culpadas", () => {
    const out = construirEstagioTurnos([
      { nome: "EEI613", horarios: [{ diaSemana: 3, inicioMin: 420, fimMin: 540 }] },
      { nome: "EEI621", horarios: [{ diaSemana: 3, inicioMin: 480, fimMin: 600 }] },
      { nome: "EEI634", horarios: [{ diaSemana: 3, inicioMin: 840, fimMin: 960 }] },
    ]);
    expect(out.mensagens).toEqual([{ diaSemana: 3, texto: "Quarta perdeu a tarde por causa de EEI634 (14:00–16:00)" }]);
  });
});

describe("tetoComEstagio", () => {
  const estagio = (semestreId: number | null, horas: number) => ({ tipo: "ESTAGIO", semestreId, inicioMin: 480, fimMin: 480 + horas * 60 });

  it("sem estágio mantém o teto", () => {
    expect(tetoComEstagio(32, [{ tipo: "PESSOAL", semestreId: null, inicioMin: 0, fimMin: 1200 }], 1)).toBe(32);
  });
  it("30h de estágio → min(32, 22) = 22", () => {
    expect(tetoComEstagio(32, [1, 2, 3, 4, 5].map(() => estagio(7, 6)), 7)).toBe(22);
  });
  it("estágio de outro semestre não conta; pouco estágio não sobe o teto", () => {
    expect(tetoComEstagio(32, [estagio(8, 30)], 7)).toBe(32);
    expect(tetoComEstagio(32, [estagio(null, 4)], 7)).toBe(32);
  });
});
