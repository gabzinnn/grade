import { describe, expect, it } from "vitest";
import { detectarChoques, detectarPreRequisitosPendentes } from "./alertas";

describe("detectarChoques", () => {
  it("aponta o par de disciplinas quando os horários se sobrepõem", () => {
    const alertas = detectarChoques([
      { nome: "Cálculo I", horarios: [{ diaSemana: 2, inicioMin: 480, fimMin: 600 }] },
      { nome: "Física I", horarios: [{ diaSemana: 2, inicioMin: 540, fimMin: 660 }] },
    ]);
    expect(alertas).toEqual([{ tipo: "CHOQUE", disciplinaA: "Cálculo I", disciplinaB: "Física I", dia: "Terça-feira" }]);
  });

  it("não aponta nada quando os horários só se tocam ou são em dias diferentes", () => {
    const alertas = detectarChoques([
      { nome: "A", horarios: [{ diaSemana: 2, inicioMin: 480, fimMin: 600 }] },
      { nome: "B", horarios: [{ diaSemana: 2, inicioMin: 600, fimMin: 660 }] },
      { nome: "C", horarios: [{ diaSemana: 3, inicioMin: 480, fimMin: 600 }] },
    ]);
    expect(alertas).toEqual([]);
  });
});

describe("detectarPreRequisitosPendentes", () => {
  it("aponta pré-requisito que não está no conjunto de garantidos", () => {
    const alertas = detectarPreRequisitosPendentes(
      [{ nome: "Pesquisa Operacional I", requisitos: [{ disciplinaExigidaId: 1, nome: "Álgebra Linear", tipo: "PRE" }] }],
      new Set(),
    );
    expect(alertas).toEqual([
      { tipo: "PRE_REQUISITO", disciplina: "Pesquisa Operacional I", requisitoFaltante: "Álgebra Linear" },
    ]);
  });

  it("ignora requisitos do tipo CO e os já garantidos", () => {
    const alertas = detectarPreRequisitosPendentes(
      [
        {
          nome: "X",
          requisitos: [
            { disciplinaExigidaId: 1, nome: "Y", tipo: "CO" },
            { disciplinaExigidaId: 2, nome: "Z", tipo: "PRE" },
          ],
        },
      ],
      new Set([2]),
    );
    expect(alertas).toEqual([]);
  });
});
