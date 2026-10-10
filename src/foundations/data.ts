import { collection, collections, type Token } from '../tokens/tokens';

/** Finds a token by "Collection:Name" (e.g. "Tokens:Text/Primary"). */
export function token(ref: string): Token {
  const [c, ...rest] = ref.split(':');
  const name = rest.join(':');
  const t = collection(c).tokens.find((x) => x.name === name);
  if (!t) throw new Error('Unknown token ' + ref);
  return t;
}

/** Raw value of a token. Moded collections use the given mode (or their default). */
export function valueOf(ref: string, modes: Record<string, string> = {}): string | number {
  const [c, ...rest] = ref.split(':');
  const col = collection(c);
  const t = col.tokens.find((x) => x.name === rest.join(':'));
  if (!t) throw new Error('Unknown token ' + ref);
  const mv = t.byMode[modes[c] ?? col.defaultMode];
  // Follow aliases into other moded collections so that e.g. Appearance resolves through the chosen Context.
  return mv.alias ? valueOf(mv.alias, modes) : mv.value;
}

export const tokensIn = (c: string, prefix = '') => collection(c).tokens.filter((t) => t.name.startsWith(prefix));
export { collection, collections };

// ---------- contrast (WCAG 2.2 relative luminance) ----------
export function parseHex(hex: string): [number, number, number, number] {
  const h = hex.replace('#', '');
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16) / 255;
  return [n(0), n(2), n(4), h.length === 8 ? n(6) : 1];
}
const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

/** Contrast ratio of fg on bg. A translucent fg is composited over bg first. */
export function contrast(fg: string, bg: string): number {
  const [fr, fg2, fb, fa] = parseHex(fg);
  const [br, bg2, bb] = parseHex(bg);
  const mix = [fr * fa + br * (1 - fa), fg2 * fa + bg2 * (1 - fa), fb * fa + bb * (1 - fa)];
  const a = lum(mix);
  const b = lum([br, bg2, bb]);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
