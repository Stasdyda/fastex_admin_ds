/**
 * Figma reference for Button: what the Figma component "Button" (node 89:406, page "Buttons",
 * file 7lvJREW1xTtkAj07P0cZif) binds in each variant, read from Figma on 30 Oct 2026.
 *
 * Used by the Storybook docs and by scripts/check-button.mjs, which renders every
 * combination in Chromium and compares computed styles with these tokens.
 *
 * source: 'figma'   = a variant that exists in Figma; the values are copied from its bindings.
 * source: 'derived' = not drawn in Figma (Figma's Danger is a single state per Type). Values follow the
 *                     Brand Hover / Pressed logic of the existing tokens and need design sign-off.
 */

export type FigmaType = 'primary' | 'secondary' | 'ghost';
export type FigmaState = 'default' | 'hover' | 'pressed' | 'focused' | 'disabled' | 'loading';

export interface StateSpec {
  /** Tokens collection names, e.g. "Background/Brand". null = no fill / no stroke. */
  background: string | null;
  border: string | null;
  /** Stroke width token from Size: 'Stroke/m' (1px) or 'Stroke/l' (2px). Figma strokes are inside. */
  borderWidth: 'Stroke/m' | 'Stroke/l' | null;
  text: string;
  icon: string;
  /** Loading only: colour of the opaque gradient stops on the label. */
  loadingText?: string;
  source: 'figma' | 'derived';
}

const S = (
  background: string | null,
  border: string | null,
  borderWidth: StateSpec['borderWidth'],
  text: string,
  icon: string,
  source: StateSpec['source'] = 'figma',
  loadingText?: string,
): StateSpec => ({ background, border, borderWidth, text, icon, source, ...(loadingText ? { loadingText } : {}) });

export const figmaButton = {
  nodeId: '89:406',
  properties: {
    Type: ['Primary', 'Secondary', 'Ghost'],
    State: ['Default', 'Hover', 'Pressed', 'Focused', 'Disabled', 'Loading', 'Danger'],
    'Has start item': 'boolean (default true)',
    'Start item': 'instance swap (default icon "add")',
    'Has end item': 'boolean (default true)',
    'End item': 'instance swap (default icon "settings")',
    Text: 'text (default "Button")',
    'Size [Button] mode': ['s (component default)', 'm', 'l'],
  },
  /** Geometry of Secondary / Default at size s, with both icons and the label "Button". */
  geometry: { frame: [108, 32], startIcon: { x: 8, y: 8, size: 16 }, label: { x: 32, y: 6, w: 44, h: 20 }, endIcon: { x: 84, y: 8, size: 16 } },
  layout: 'Horizontal auto layout, hug width, fixed height, centred on both axes, strokes inside, label does not wrap or truncate.',
  states: {
    primary: {
      default: S('Background/Brand', null, null, 'Text/Inverse', 'Icon/Inverse'),
      hover: S('Background/Brand Hover', null, null, 'Text/Inverse', 'Icon/Inverse'),
      pressed: S('Background/Brand Pressed', null, null, 'Text/Inverse', 'Icon/Inverse'),
      focused: S('Background/Brand Hover', 'Stroke/Focus Strong', 'Stroke/l', 'Text/Inverse', 'Icon/Inverse'),
      disabled: S('Background/Disabled', 'Stroke/Disabled', 'Stroke/m', 'Text/Disabled', 'Icon/Disabled'),
      loading: S('Background/Brand', null, null, 'Text/Inverse', 'Icon/Secondary Inverse', 'figma', 'Icon/Inverse'),
    },
    secondary: {
      default: S('Background/White', 'Stroke/Default', 'Stroke/m', 'Text/Primary', 'Icon/Primary'),
      hover: S('Background/White', 'Stroke/Brand Hover', 'Stroke/m', 'Text/Brand Hover', 'Icon/Brand Hover'),
      pressed: S('Background/White', 'Stroke/Brand Pressed', 'Stroke/m', 'Text/Brand Pressed', 'Icon/Brand Pressed'),
      focused: S('Background/White', 'Stroke/Focus', 'Stroke/l', 'Text/Brand Hover', 'Icon/Brand Hover'),
      disabled: S('Background/Disabled', 'Stroke/Disabled', 'Stroke/m', 'Text/Disabled', 'Icon/Disabled'),
      loading: S('Background/White', 'Stroke/Default', 'Stroke/m', 'Text/Primary', 'Icon/Primary', 'figma', 'Icon/Primary'),
    },
    ghost: {
      default: S(null, null, null, 'Text/Primary', 'Icon/Primary'),
      hover: S('Background/Tertiary', null, null, 'Text/Primary', 'Icon/Primary'),
      pressed: S('Background/Tertiary', null, null, 'Text/Primary', 'Icon/Primary'),
      focused: S('Background/Secondary', 'Stroke/Focus', 'Stroke/l', 'Text/Primary', 'Icon/Primary'),
      disabled: S(null, null, null, 'Text/Disabled', 'Icon/Disabled'),
      loading: S(null, null, null, 'Text/Primary', 'Icon/Primary', 'figma', 'Icon/Primary'),
    },
  },
  /** Figma State=Danger exists only as a resting state. Everything except "default" is derived. */
  danger: {
    primary: {
      default: S('Background/Negative', null, null, 'Text/Inverse', 'Icon/Inverse'),
      hover: S('Background/Negative Hover', null, null, 'Text/Inverse', 'Icon/Inverse', 'derived'),
      pressed: S('Background/Negative Pressed', null, null, 'Text/Inverse', 'Icon/Inverse', 'derived'),
      focused: S('Background/Negative Hover', 'Stroke/Focus Strong', 'Stroke/l', 'Text/Inverse', 'Icon/Inverse', 'derived'),
      disabled: S('Background/Disabled', 'Stroke/Disabled', 'Stroke/m', 'Text/Disabled', 'Icon/Disabled', 'derived'),
      loading: S('Background/Negative', null, null, 'Text/Inverse', 'Icon/Secondary Inverse', 'derived', 'Icon/Inverse'),
    },
    secondary: {
      default: S('Background/White', 'Stroke/Negative', 'Stroke/m', 'Text/Negative', 'Icon/Negative'),
      hover: S('Background/White', 'Stroke/Negative Hover', 'Stroke/m', 'Text/Negative Hover', 'Icon/Negative Hover', 'derived'),
      pressed: S('Background/White', 'Stroke/Negative Pressed', 'Stroke/m', 'Text/Negative Pressed', 'Icon/Negative Pressed', 'derived'),
      focused: S('Background/White', 'Stroke/Focus', 'Stroke/l', 'Text/Negative Hover', 'Icon/Negative Hover', 'derived'),
      disabled: S('Background/Disabled', 'Stroke/Disabled', 'Stroke/m', 'Text/Disabled', 'Icon/Disabled', 'derived'),
      loading: S('Background/White', 'Stroke/Negative', 'Stroke/m', 'Text/Negative', 'Icon/Negative', 'derived', 'Icon/Negative'),
    },
    ghost: {
      default: S(null, null, null, 'Text/Negative', 'Icon/Negative'),
      hover: S('Background/Tertiary', null, null, 'Text/Negative Hover', 'Icon/Negative Hover', 'derived'),
      pressed: S('Background/Tertiary', null, null, 'Text/Negative Pressed', 'Icon/Negative Pressed', 'derived'),
      focused: S('Background/Secondary', 'Stroke/Focus', 'Stroke/l', 'Text/Negative', 'Icon/Negative', 'derived'),
      disabled: S(null, null, null, 'Text/Disabled', 'Icon/Disabled', 'derived'),
      loading: S(null, null, null, 'Text/Negative', 'Icon/Negative', 'derived', 'Icon/Negative'),
    },
  },
} as const;

export const buttonSizes = ['s', 'm', 'l'] as const;
export const buttonTypes = ['primary', 'secondary', 'ghost'] as const;
export const buttonStates = ['default', 'hover', 'pressed', 'focused', 'disabled', 'loading'] as const;
