// Loads the generated CSS in Chromium and checks that every CSS variable, in every mode, resolves to the
// value in tokens/figma-variables.json. Uses its own resolver, independent of build-tokens.mjs.
// Needs a Chromium for playwright-core: `npx playwright-core install chromium` (or PLAYWRIGHT_BROWSERS_PATH).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { collections: C } = JSON.parse(readFileSync(join(root, 'tokens/figma-variables.json'), 'utf8'));
const css = readFileSync(join(root, 'src/tokens/tokens.css'), 'utf8');
const { collections: T } = await import(join(root, 'src/tokens/tokens.ts')).catch(() => ({ collections: null }));

// Defaults the CSS is meant to apply when no attribute is set.
const DEFAULTS = { Context: 'Brand', Appearance: 'Fill', 'Size [Button]': 'm', 'Size [Input]': 'm', 'Size [Table]': 'Default', 'Size [Badge]': 's', 'Shape [Badge]': 'Rounded' };
const ATTR = { Context: 'data-context', Appearance: 'data-appearance', 'Size [Button]': 'data-button-size', 'Size [Input]': 'data-input-size', 'Size [Table]': 'data-table-density', 'Size [Badge]': 'data-badge-size', 'Shape [Badge]': 'data-badge-shape' };
const WEIGHTS = { Regular: '400', Medium: '500', 'Semi Bold': '600', Bold: '700', Black: '900' };
const modeAttr = (m) => m.replace(/\(.*\)/, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

const vars = new Map();
for (const [c, col] of Object.entries(C)) for (const [name, type, value] of col.vars) vars.set(`${c}:${name}`, { c, name, type, values: col.modes.length === 1 ? [value] : value });

function resolve(ref, modes) {
  const v = vars.get(ref);
  if (!v) throw new Error('missing ' + ref);
  const col = C[v.c];
  const mode = modes[v.c] ?? DEFAULTS[v.c] ?? col.modes[0];
  const raw = v.values[col.modes.indexOf(mode)];
  return typeof raw === 'string' && raw.startsWith('@') ? resolve(raw.slice(1), modes) : { raw, type: v.type, name: v.name };
}
function expected(ref, modes) {
  const { raw, type, name } = resolve(ref, modes);
  if (type === 'F') return raw === 0 ? '0' : `${raw}px`;
  if (type === 'S' && name.startsWith('Weight/')) return WEIGHTS[raw];
  if (type === 'S') return { family: raw };
  return String(raw).toLowerCase();
}

// The CSS name for each Figma variable comes from the generated TS map (checked separately for coverage).
const cssVarOf = new Map();
for (const col of T ?? []) for (const t of col.tokens) cssVarOf.set(`${col.name}:${t.name}`, t.cssVar);

const cases = [];
const add = (label, attrs, ref, modes, nestedIn) => cases.push({ label, attrs, nestedIn, ref, cssVar: cssVarOf.get(ref), want: expected(ref, modes) });
for (const [c, col] of Object.entries(C)) {
  for (const [name] of col.vars) {
    const ref = `${c}:${name}`;
    if (!cssVarOf.has(ref)) throw new Error('No CSS variable generated for ' + ref);
    if (col.modes.length === 1) add(ref, {}, ref, {});
    else for (const m of col.modes) add(`${ref} [${m}]`, { [ATTR[c]]: modeAttr(m) }, ref, { [c]: m });
  }
}
// Every context x appearance pair on one element, a context-only element, and a context nested in an appearance scope.
const appRefs = C.Appearance.vars.map(([n]) => `Appearance:${n}`);
for (const ctx of C.Context.modes) {
  for (const app of C.Appearance.modes) for (const ref of appRefs) add(`${ref} [${ctx} x ${app}]`, { 'data-context': modeAttr(ctx), 'data-appearance': modeAttr(app) }, ref, { Context: ctx, Appearance: app });
  for (const ref of appRefs) add(`${ref} [${ctx} only]`, { 'data-context': modeAttr(ctx) }, ref, { Context: ctx });
  for (const app of C.Appearance.modes) for (const ref of appRefs) add(`${ref} [${ctx} inside ${app}]`, { 'data-context': modeAttr(ctx) }, ref, { Context: ctx, Appearance: app }, { 'data-appearance': modeAttr(app) });
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
await page.setContent(`<!doctype html><style>${css}</style><body></body>`);
const got = await page.evaluate((cases) => {
  return cases.map((k) => {
    let host = document.body;
    if (k.nestedIn) { const o = document.createElement('div'); for (const [a, v] of Object.entries(k.nestedIn)) o.setAttribute(a, v); host.appendChild(o); host = o; }
    const el = document.createElement('div');
    for (const [a, v] of Object.entries(k.attrs)) el.setAttribute(a, v);
    host.appendChild(el);
    const v = getComputedStyle(el).getPropertyValue(k.cssVar).trim();
    (k.nestedIn ? host : el).remove();
    return v;
  });
}, cases);
await browser.close();

let fails = 0;
cases.forEach((k, i) => {
  const g = got[i].toLowerCase();
  const fam = typeof k.want === 'object' ? k.want.family.toLowerCase() : null;
  const ok = fam ? g.startsWith(`"${fam}"`) || g.startsWith(fam + ',') : g === k.want;
  if (!ok) { fails++; if (fails <= 25) console.log(`FAIL ${k.label} ${k.cssVar}: got "${got[i]}", want ${JSON.stringify(k.want)}`); }
});
const total = [...vars.keys()].length;
console.log(`${cases.length} checks over ${total} Figma variables: ${cases.length - fails} passed, ${fails} failed.`);
process.exit(fails ? 1 : 0);
