function rgbParaHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
}

function hexParaRgb(hex: string): [number, number, number] {
  const limpo = hex.replace("#", "");
  const bigint = parseInt(limpo, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function hslParaRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/** FNV-1a + finalizer de avalanche — um hash *31 simples deixa strings numéricas
 * curtas e sequenciais (disciplinaId "40","41","42"...) praticamente lineares entre
 * si, então o hue calculado a partir dele também sai quase igual. Isso mistura os
 * bits o suficiente pra IDs vizinhos caírem em matizes bem diferentes. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Cor própria de cada disciplina — independente da categoria (tipo SIGA/Google Calendar:
 * cada matéria tem uma cor, a categoria fica só na borda). Roda o círculo de matiz
 * inteiro (0–360°) a partir da seed, então duas disciplinas da mesma categoria ficam tão
 * diferentes entre si quanto duas de categorias diferentes. Determinístico.
 */
export function corPorDisciplina(seed: string): string {
  const n = hash(seed);
  const hue = n % 360;
  const [r, g, b] = hslParaRgb(hue, 58, 60);
  return rgbParaHex(r, g, b);
}

/**
 * Mistura uma cor com branco pra virar um tint claro, mas **opaco** — usado como
 * fundo dos blocos do calendário. Precisa ser opaco (em vez de alpha sobre o fundo)
 * pra cobrir de vez a grade de horas atrás do bloco, como no protótipo de referência;
 * um overlay semitransparente deixa a linha da grade escapando por baixo.
 */
export function tintClaro(hex: string, mistura: number = 0.8): string {
  const [r, g, b] = hexParaRgb(hex);
  return rgbParaHex(r + (255 - r) * mistura, g + (255 - g) * mistura, b + (255 - b) * mistura);
}
