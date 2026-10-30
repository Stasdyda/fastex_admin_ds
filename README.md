# ds-admin-panel

Code side of the Figma design system **DS-AdminPanel-2.0** (file key `7lvJREW1xTtkAj07P0cZif`).
Stage 1: design tokens as CSS variables, documented in Storybook. Components come next.

## Run

```bash
npm install
npm run storybook        # builds tokens, opens Storybook on :6006
npm run build-storybook  # static build in storybook-static/
npm run check:tokens     # checks every CSS variable, in every mode, against the Figma export
npm run typecheck
```

`check:tokens` needs Chromium for playwright-core: `npx playwright-core install chromium`.

## Layout

| Path | What it is |
|---|---|
| `tokens/figma-variables.json` | Snapshot of every Figma variable, mode and alias. The source of truth in this repo. |
| `scripts/export-figma-variables.js` | Plugin code that produces the snapshot from the Figma file. |
| `scripts/build-tokens.mjs` | Generates `src/tokens/tokens.css` and `src/tokens/tokens.ts`. |
| `scripts/check-tokens.mjs` | Loads the CSS in Chromium and compares 724 resolved values with the snapshot. |
| `src/tokens/` | Generated. Don't edit. |
| `src/foundations/` | Blocks that render the token pages. |
| `src/docs/` | Storybook pages (MDX). |

## Components

| Component | Status |
|---|---|
| Button | Matched to Figma (pilot). `src/components/ui/button.tsx` + `button.css`; Figma reference in `button.figma.ts`. |
| Badge, Input, Label, Select, Table | Stock shadcn/ui (new-york-v4, shadcn-ui/ui commit 96da9cc), themed by tokens only. Not yet matched to Figma. |

Rules for converting a component (Button is the reference):
- Behaviour from shadcn/Radix (native elements, Slot, keyboard, focus, ARIA). Visuals from Figma, through tokens only.
- Figma component properties become props; Figma variable modes become `data-*` attributes; interaction
  states are real CSS states (`:hover`, `:active`, `:focus-visible`), never extra variants.
- Stories: Playground (controls = Figma properties), Matrix, States (forced with storybook-addon-pseudo-states
  for review), Content stress test, interaction tests. Accessibility (axe) runs on every story.

Checks:

```bash
npm run test:stories   # every story's interaction test + accessibility check, in Chromium (Vitest)
npm run build-storybook && npx http-server storybook-static -p 6007
npm run check:button   # 682 computed-style comparisons with the Figma Button, using real hover/press/focus
```

`components.json` is set up for the shadcn CLI: `npx shadcn@latest add dialog` works on a machine that can reach ui.shadcn.com.

## Using the tokens

```ts
import './tokens/tokens.css';
```

```css
.card { background: var(--ds-background-white); border-radius: var(--ds-radius-m); padding: var(--ds-space-m); }
```

Figma modes are attributes: `data-context`, `data-appearance`, `data-button-size`, `data-input-size`,
`data-table-density`, `data-badge-size`, `data-badge-shape`. See the "Using tokens" page in Storybook.

## Updating from Figma

1. Run `scripts/export-figma-variables.js` in the Figma file and replace `collections` in `tokens/figma-variables.json`; update `meta.exportedAt`.
2. `npm run tokens && npm run check:tokens`
3. Review the `tokens.css` diff and commit.

## Notes

- Suisse Int'l is a licensed font and isn't in the repo; pages use the fallback stack until it's added.
- The `Workbook · spacing` collection isn't exported: nothing in the Figma file uses it.
- Open questions from the Figma audit are listed on the Storybook Introduction page.
