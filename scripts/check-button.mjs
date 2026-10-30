// Compares the coded Button with the Figma Button, state by state, in a real browser.
//
// For every Type x Size x Danger it hovers, presses and keyboard-focuses the button in the
// built Storybook (real :hover / :active / :focus-visible, no forced states), reads the
// computed styles and compares them with the tokens Figma binds (src/components/ui/button.figma.ts)
// and the Size [Button] mode values (src/tokens/tokens.ts).
//
// Run: npm run build-storybook, serve storybook-static (e.g. `npx http-server storybook-static -p 6007`),
// then `npm run check:button [-- http://localhost:6007]`.
import { chromium } from 'playwright-core';
import { collections } from '../src/tokens/tokens.ts';
import { figmaButton, buttonSizes, buttonTypes } from '../src/components/ui/button.figma.ts';

const base = process.argv[2] ?? 'http://localhost:6007';

// ---------- expected values ----------
const col = (name) => collections.find((c) => c.name === name);
function resolve(ref, modes = {}) {
  const [c, ...rest] = ref.split(':');
  const collection = col(c);
  const t = collection.tokens.find((x) => x.name === rest.join(':'));
  if (!t) throw new Error('Unknown token ' + ref);
  const mv = t.byMode[modes[c] ?? collection.defaultMode];
  return mv.alias ? resolve(mv.alias, modes) : mv.value;
}
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = h.length === 8 ? Math.round((parseInt(h.slice(6, 8), 16) / 255) * 1000) / 1000 : 1;
  return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
};
const color = (token) => (token ? hexToRgb(String(resolve('Tokens:' + token))) : 'rgba(0, 0, 0, 0)');
const px = (v) => `${v}px`;
const WEIGHT = { Regular: '400', Medium: '500', 'Semi Bold': '600', Bold: '700', Black: '900' };
function sizeSpec(size) {
  const m = { 'Size [Button]': size };
  const v = (n) => resolve('Size [Button]:' + n, m);
  return {
    height: px(v('Height')),
    paddingX: px(v('Horizontal Padding')),
    gap: px(v('Horizontal Gap')),
    fontSize: px(v('Font Size')),
    lineHeight: px(v('Line Height')),
    fontWeight: WEIGHT[v('Font Weight')],
    iconSize: px(v('Icon Size')),
    radius: px(v('Radius')),
  };
}

// ---------- measuring ----------
async function measure(page, testId) {
  return page.evaluate((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`);
    const cs = getComputedStyle(el);
    const label = el.querySelector('.ds-button__label');
    const icons = [...el.querySelectorAll('.ds-button__icon')];
    const ls = label ? getComputedStyle(label) : null;
    const box = el.getBoundingClientRect();
    const lb = label?.getBoundingClientRect();
    const ib = icons.map((i) => i.getBoundingClientRect());
    return {
      background: cs.backgroundColor,
      boxShadow: cs.boxShadow,
      height: cs.height,
      paddingLeft: cs.paddingLeft,
      paddingRight: cs.paddingRight,
      gap: cs.columnGap,
      radius: cs.borderTopLeftRadius,
      label: ls && { color: ls.color, fontSize: ls.fontSize, lineHeight: ls.lineHeight, fontWeight: ls.fontWeight, fontFamily: ls.fontFamily, backgroundImage: ls.backgroundImage },
      icons: icons.map((i) => ({ color: getComputedStyle(i).color, w: getComputedStyle(i).width, h: getComputedStyle(i).height })),
      geometry: {
        w: box.width, h: box.height,
        startIconX: ib[0] ? ib[0].left - box.left : null, startIconY: ib[0] ? ib[0].top - box.top : null,
        labelX: lb ? lb.left - box.left : null, labelY: lb ? lb.top - box.top : null, labelW: lb?.width, labelH: lb?.height,
        endIconX: ib[1] ? ib[1].left - box.left : null,
      },
      focusVisible: el.matches(':focus-visible'),
      hovered: el.matches(':hover'),
      active: el.matches(':active'),
    };
  }, testId);
}
// "inset 0 0 0 1px rgb(...)" -> Chrome reports "rgb(...) 0px 0px 0px 1px inset"
function parseShadow(s) {
  if (!s || s === 'none') return { width: '0px', color: null };
  const m = s.match(/^(rgba?\([^)]*\)) 0px 0px 0px ([\d.]+px) inset$/);
  return m ? { color: m[1], width: m[2] } : { raw: s };
}

const results = [];
function compare(where, prop, got, want) {
  const ok = got === want;
  results.push({ where, prop, got, want, ok });
}

function checkState(where, m, spec, size) {
  compare(where, 'background', m.background, color(spec.background));
  const sh = parseShadow(m.boxShadow);
  const wantWidth = spec.borderWidth ? px(resolve('Size:' + spec.borderWidth)) : '0px';
  compare(where, 'border width', sh.width, spec.border ? wantWidth : '0px');
  if (spec.border) compare(where, 'border colour', sh.color, color(spec.border));
  if (spec.loadingText) {
    compare(where, 'label colour', m.label.color, 'rgba(0, 0, 0, 0)');
    compare(where, 'loading gradient colour', m.label.backgroundImage.includes(color(spec.loadingText)) ? color(spec.loadingText) : m.label.backgroundImage, color(spec.loadingText));
  } else {
    compare(where, 'label colour', m.label.color, color(spec.text));
  }
  m.icons.forEach((ic, i) => compare(where, `icon ${i + 1} colour`, ic.color, color(spec.icon)));
  if (size) {
    const z = sizeSpec(size);
    compare(where, 'height', m.height, z.height);
    compare(where, 'padding left', m.paddingLeft, z.paddingX);
    compare(where, 'padding right', m.paddingRight, z.paddingX);
    compare(where, 'gap', m.gap, z.gap);
    compare(where, 'radius', m.radius, z.radius);
    compare(where, 'font size', m.label.fontSize, z.fontSize);
    compare(where, 'line height', m.label.lineHeight, z.lineHeight);
    compare(where, 'font weight', m.label.fontWeight, z.fontWeight);
    compare(where, 'font family', m.label.fontFamily.split(',')[0].replace(/"/g, ''), "Suisse Int'l");
    m.icons.forEach((ic, i) => compare(where, `icon ${i + 1} size`, `${ic.w}x${ic.h}`, `${z.iconSize}x${z.iconSize}`));
  }
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

// 1) Type x Size x Danger in default, hover, pressed and focused, from the Matrix story.
await page.goto(`${base}/iframe.html?viewMode=story&id=components-button--matrix`, { waitUntil: 'networkidle' });
const geometry = {};
for (const t of buttonTypes) {
  for (const size of buttonSizes) {
    for (const danger of [false, true]) {
      const id = `matrix-${t}-${size}${danger ? '-danger' : ''}`;
      const specs = danger ? figmaButton.danger[t] : figmaButton.states[t];
      const loc = page.getByTestId(id);
      const label = `${t}/${size}${danger ? '/danger' : ''}`;

      await page.mouse.move(0, 0);
      await page.evaluate(() => document.activeElement?.blur());
      checkState(`${label} default`, await measure(page, id), specs.default, size);
      if (t === 'secondary' && size === 's' && !danger) geometry.code = (await measure(page, id)).geometry;

      const b = await loc.boundingBox();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      const hov = await measure(page, id);
      if (!hov.hovered) throw new Error('hover did not apply on ' + id);
      checkState(`${label} hover`, hov, specs.hover);

      await page.mouse.down();
      const act = await measure(page, id);
      if (!act.active) throw new Error(':active did not apply on ' + id);
      checkState(`${label} pressed`, act, specs.pressed);
      await page.mouse.up();
      await page.mouse.move(0, 0);
      await page.evaluate(() => document.activeElement?.blur());

      await page.keyboard.press('Shift');
      await loc.focus();
      const foc = await measure(page, id);
      if (!foc.focusVisible) throw new Error(':focus-visible did not apply on ' + id);
      checkState(`${label} focused`, foc, specs.focused);
      await page.evaluate(() => document.activeElement?.blur());
    }
  }
}

// 2) Disabled and Loading (and Danger, the resting Figma variant) from the States story.
await page.goto(`${base}/iframe.html?viewMode=story&id=components-button--states`, { waitUntil: 'networkidle' });
await page.mouse.move(0, 0);
for (const t of buttonTypes) {
  for (const danger of [false, true]) {
    const specs = danger ? figmaButton.danger[t] : figmaButton.states[t];
    for (const st of ['disabled', 'loading']) {
      const id = `state-${t}-${st}${danger ? '-danger' : ''}`;
      checkState(`${t}${danger ? '/danger' : ''} ${st}`, await measure(page, id), specs[st]);
    }
  }
  checkState(`${t} Figma State=Danger`, await measure(page, `state-${t}-danger`), figmaButton.danger[t].default);
}
await browser.close();

// ---------- report ----------
const fails = results.filter((r) => !r.ok);
const byProp = {};
for (const r of fails) (byProp[r.prop] ??= []).push(r);
console.log(`${results.length} comparisons, ${results.length - fails.length} match Figma, ${fails.length} differ.`);
for (const [prop, list] of Object.entries(byProp)) {
  const sample = list[0];
  console.log(`\n${prop}: ${list.length} differ, e.g. ${sample.where}: got ${sample.got}, Figma ${sample.want}`);
}
const fig = figmaButton.geometry;
const g = geometry.code;
console.log('\nGeometry, Secondary / s / "Button" with both icons (Figma vs code):');
console.log(`  frame        ${fig.frame[0]}x${fig.frame[1]}  vs  ${g.w.toFixed(2)}x${g.h.toFixed(2)}`);
console.log(`  start icon   x=${fig.startIcon.x} y=${fig.startIcon.y}  vs  x=${g.startIconX} y=${g.startIconY}`);
console.log(`  label        x=${fig.label.x} y=${fig.label.y} ${fig.label.w}x${fig.label.h}  vs  x=${g.labelX} y=${g.labelY} ${g.labelW.toFixed(2)}x${g.labelH}`);
console.log(`  end icon     x=${fig.endIcon.x}  vs  x=${g.endIconX.toFixed(2)}`);
if (errors.length) console.log('\nPage errors:', errors);
process.exit(fails.length ? 1 : 0);
