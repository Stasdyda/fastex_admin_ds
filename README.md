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
