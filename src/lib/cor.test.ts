import { describe, expect, it } from "vitest";
import { corPorDisciplina, tintClaro } from "./cor";

describe("corPorDisciplina", () => {
  it("é determinístico para a mesma seed", () => {
    expect(corPorDisciplina("123")).toBe(corPorDisciplina("123"));
  });

  it("produz cores diferentes para seeds diferentes", () => {
    expect(corPorDisciplina("1")).not.toBe(corPorDisciplina("2"));
  });

  it("retorna um hex válido", () => {
    expect(corPorDisciplina("42")).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("tintClaro", () => {
  it("com mistura 1 vira branco puro", () => {
    expect(tintClaro("#2F6F8F", 1)).toBe("#ffffff");
  });

  it("com mistura 0 mantém a cor original", () => {
    expect(tintClaro("#2F6F8F", 0)).toBe("#2f6f8f");
  });

  it("clareia sem trocar a família de cor", () => {
    const claro = tintClaro("#2F6F8F", 0.8);
    expect(claro).toMatch(/^#[0-9a-f]{6}$/i);
    expect(claro).not.toBe("#2f6f8f");
  });
});
