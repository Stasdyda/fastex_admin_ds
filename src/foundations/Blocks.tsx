import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Unstyled } from '@storybook/addon-docs/blocks';
import { collection, contrast, tokensIn, valueOf } from './data';

const px = (v: string | number) => (typeof v === 'number' ? `${v}px` : v);
const short = (alias: string | null) => (alias ? alias.replace(':', ' / ') : '—');

// Unstyled keeps Storybook's docs typography and table styles out of the token blocks.
export function Doc({ children }: { children: ReactNode }) {
  return (
    <Unstyled>
      <div className="dsdoc">{children}</div>
    </Unstyled>
  );
}

export function Note({ title, children, kind = 'caution' }: { title: string; children: ReactNode; kind?: 'caution' | 'info' }) {
  return (
    <Unstyled>
      <div className={`dsdoc dsdoc-note ${kind === 'info' ? 'info' : ''}`}>
        <b>{title}</b>
        <div>{children}</div>
      </div>
    </Unstyled>
  );
}

/* ---------- Colour primitives ---------- */
export function PrimitivePalette() {
  const families = new Map<string, ReturnType<typeof tokensIn>>();
  for (const t of tokensIn('Colors')) {
    const fam = t.name.includes('·') ? 'Alpha' : t.name.split('/')[0];
    families.set(fam, [...(families.get(fam) ?? []), t]);
  }
  return (
    <Doc>
      {[...families.entries()].map(([fam, list]) => (
        <section className="dsdoc-family" key={fam}>
          <h4>{fam}</h4>
          <div className="dsdoc-steps">
            {list.map((t) => {
              const v = String(t.byMode.Light.value);
              const step = fam === 'Alpha' ? t.name : t.name.split('/')[1];
              return (
                <div className="dsdoc-step" key={t.name} title={`${t.cssVar}\n${t.description}`}>
                  <div className={v.length === 9 ? 'dsdoc-checker' : ''}>
                    <div className="chip" style={{ background: `var(${t.cssVar})` }} />
                  </div>
                  <div className="meta">
                    <b>{step}</b>
                    <span className="mono muted">{v}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </Doc>
  );
}

/* ---------- Semantic colours with contrast ---------- */
type Rule = { surface: string; min: number; exempt?: string } | null;

// Which surface each semantic token is read on, and the WCAG 2.2 minimum that applies.
function contrastRule(name: string): Rule {
  const [group, label] = name.split('/');
  if (group === 'Background') return null;
  if (label.endsWith('Subtle')) return null; // tints: read on fills, measured on the Context page
  const dark = /Inverse/.test(label);
  const surface = dark ? 'Tokens:Background/Primary Inverse' : 'Tokens:Background/White';
  if (group === 'Text') {
    if (/^(Tertiary|Disabled)$/.test(label)) return { surface, min: 4.5, exempt: 'Disabled text and separators only' };
    return { surface, min: 4.5 };
  }
  if (group === 'Icon') {
    if (/^(Tertiary|Disabled)$/.test(label)) return { surface, min: 3, exempt: 'Disabled or decorative icons only' };
    return { surface, min: 3 };
  }
  if (group === 'Stroke') {
    if (/^(Default|Subtle|Disabled|White)$/.test(label)) return { surface, min: 3, exempt: 'Dividers, read-only and disabled fields' };
    if (label === 'Inverse') return { surface, min: 3, exempt: 'Dividers on dark surfaces' };
    return { surface, min: 3 };
  }
  if (group === 'Chart') return { surface, min: 3 };
  return null;
}

function Verdict({ ratio, min, exempt }: { ratio: number; min: number; exempt?: string }) {
  const pass = ratio >= min;
  const cls = pass ? 'pass' : exempt ? 'exempt' : 'fail';
  return (
    <span title={exempt ?? ''}>
      <span className="mono">{ratio.toFixed(2)}:1</span>{' '}
      <span className={`dsdoc-verdict ${cls}`}>{pass ? `Pass ${min}:1` : exempt ? 'Exempt' : `Below ${min}:1`}</span>
    </span>
  );
}

export function SemanticTable({ group }: { group: 'Background' | 'Text' | 'Icon' | 'Stroke' | 'Chart' }) {
  const list = tokensIn('Tokens', group + '/');
  const showContrast = group !== 'Background';
  return (
    <Doc>
      <table className="dsdoc-table">
        <thead>
          <tr>
            <th style={{ width: 48 }} />
            <th>Token</th>
            <th>Alias</th>
            <th style={{ textAlign: 'right' }}>Value</th>
            {showContrast && <th>Contrast</th>}
            <th>Use</th>
          </tr>
        </thead>
        <tbody>
          {list.map((t) => {
            const v = String(valueOf('Tokens:' + t.name));
            const rule = contrastRule(t.name);
            return (
              <tr key={t.name}>
                <td>
                  <div className="dsdoc-checker" style={{ borderRadius: 4 }}>
                    <div className="dsdoc-swatch" style={{ background: `var(${t.cssVar})` }} />
                  </div>
                </td>
                <td>
                  <div>{t.name.split('/')[1]}</div>
                  <code className="muted">{t.cssVar}</code>
                </td>
                <td className="mono muted">{short(t.byMode['Mode 1'].alias)}</td>
                <td className="num">{v}</td>
                {showContrast && (
                  <td>
                    {rule ? (
                      <>
                        <Verdict ratio={contrast(v, String(valueOf(rule.surface)))} min={rule.min} exempt={rule.exempt} />
                        <div className="muted" style={{ fontSize: 12 }}>on {rule.surface.split('/')[1]}</div>
                      </>
                    ) : (
                      <span className="muted">On fills, see Context</span>
                    )}
                  </td>
                )}
                <td className="muted" style={{ maxWidth: 320 }}>{t.description}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Doc>
  );
}

/* ---------- Context x Appearance ---------- */
export function ContextMatrix() {
  const ctx = collection('Context');
  const app = collection('Appearance');
  return (
    <Doc>
      <div className="dsdoc-matrix">
        <div />
        {app.modes.map((a) => (
          <div className="head" key={a}>
            {a} <code className="muted">data-appearance="{a.toLowerCase()}"</code>
          </div>
        ))}
        {ctx.modes.map((c, ci) => (
          <Row key={c} label={c} attr={ctx.modeValues![ci]}>
            {app.modes.map((a, ai) => {
              const modes = { Context: c, Appearance: a };
              const fg = String(valueOf('Appearance:Text', modes));
              const bgRaw = String(valueOf('Appearance:Background', modes));
              // Ghost has no visible fill of its own in components, but the token still resolves to Soft/Background.
              const ratio = contrast(fg, bgRaw);
              return (
                <div key={a} data-context={ctx.modeValues![ci]} data-appearance={app.modeValues![ai]} className="dsdoc-sample">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="dot" /> Label
                  </span>
                  <span className="ratio">{ratio.toFixed(1)}:1</span>
                </div>
              );
            })}
          </Row>
        ))}
      </div>
    </Doc>
  );
}
function Row({ label, attr, children }: { label: string; attr: string; children: ReactNode }) {
  return (
    <>
      <div>
        <div style={{ fontWeight: 500 }}>{label}</div>
        <code className="muted">"{attr}"</code>
      </div>
      {children}
    </>
  );
}

export function ModeTable({ name }: { name: string }) {
  const col = collection(name);
  return (
    <Doc>
      <div className="dsdoc-scroll">
      <table className="dsdoc-table">
        <thead>
          <tr>
            <th>Token</th>
            {col.modes.map((m) => (
              <th key={m}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {col.tokens.map((t) => (
            <tr key={t.name}>
              <td>
                <div>{t.name}</div>
                <code className="muted">{t.cssVar}</code>
              </td>
              {col.modes.map((m) => {
                const mv = t.byMode[m];
                const v = mv.alias ? valueOf(mv.alias, { [name]: m }) : mv.value;
                return (
                  <td key={m}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {t.type === 'color' && <div className="dsdoc-swatch" style={{ width: 20, height: 20, background: String(v) }} />}
                      <span className="mono">{t.type === 'dimension' ? px(v) : String(v)}</span>
                    </div>
                    <div className="mono muted" style={{ fontSize: 11 }}>{mv.alias ? mv.alias.split(':')[1] : ''}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </Doc>
  );
}

/* ---------- Size scales ---------- */
export function ScaleTable({ prefix, render }: { prefix: string; render: (cssVar: string, v: number) => ReactNode }) {
  const list = tokensIn('Size', prefix).sort((a, b) => Number(a.byMode['Mode 1'].value) - Number(b.byMode['Mode 1'].value));
  return (
    <Doc>
      <table className="dsdoc-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>CSS variable</th>
            <th style={{ textAlign: 'right' }}>Value</th>
            <th style={{ width: '45%' }}>Preview</th>
          </tr>
        </thead>
        <tbody>
          {list.map((t) => {
            const v = Number(t.byMode['Mode 1'].value);
            return (
              <tr key={t.name}>
                <td>{t.name.split('/')[1]}</td>
                <td><code className="muted">{t.cssVar}</code></td>
                <td className="num">{v}px</td>
                <td>{render(t.cssVar, v)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Doc>
  );
}
export const SpacingBar = (cssVar: string) => <div className="dsdoc-bar" style={{ width: `var(${cssVar})` }} />;
export const RadiusBox = (cssVar: string) => <div className="dsdoc-radius" style={{ borderRadius: `var(${cssVar})` }} />;
export const StrokeLine = (cssVar: string) => <div className="dsdoc-stroke" style={{ height: `var(${cssVar})` }} />;

/* ---------- Typography ---------- */
export function FontFamilies() {
  return (
    <Doc>
      <table className="dsdoc-table">
        <thead>
          <tr><th>Token</th><th>Figma value</th><th>CSS stack</th><th>Sample</th></tr>
        </thead>
        <tbody>
          {tokensIn('Typography', 'Family/').map((t) => (
            <tr key={t.name}>
              <td>{t.name}<br /><code className="muted">{t.cssVar}</code></td>
              <td>{String(t.byMode['Mode 1'].value)}</td>
              <td className="mono muted" style={{ maxWidth: 280 }}><ComputedValue cssVar={t.cssVar} /></td>
              <td style={{ fontFamily: `var(${t.cssVar})`, fontSize: 16 }}>Withdrawal 0.0421 BTC · 12 Oct 2026</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Doc>
  );
}

// Shows what a CSS variable computes to in the page, e.g. the full font stack.
function ComputedValue({ cssVar }: { cssVar: string }) {
  const [v, setV] = useState('');
  useEffect(() => setV(getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()), [cssVar]);
  return <>{v}</>;
}

export function FontWeights() {
  return (
    <Doc>
      <div className="dsdoc-row">
        {tokensIn('Typography', 'Weight/').map((t) => (
          <div key={t.name}>
            <div style={{ fontWeight: `var(${t.cssVar})` as CSSProperties['fontWeight'], fontSize: 20, lineHeight: '28px', color: 'var(--ds-text-headline)' }}>
              {t.name.split('/')[1]}
            </div>
            <code className="cap">{t.cssVar}</code>
          </div>
        ))}
      </div>
    </Doc>
  );
}

export type Pair = { size: number; lh: number; use: string; status?: string };
export function TypePairs({ pairs }: { pairs: Pair[] }) {
  return (
    <Doc>
      <table className="dsdoc-table">
        <thead>
          <tr><th>Size / line height</th><th>Tokens</th><th>Specimen</th><th>Where it is used</th></tr>
        </thead>
        <tbody>
          {pairs.map((p) => (
            <tr key={`${p.size}/${p.lh}`}>
              <td className="mono">{p.size}/{p.lh}{p.status ? <div><span className="dsdoc-verdict exempt">{p.status}</span></div> : null}</td>
              <td><code className="muted">--ds-font-size-{p.size}</code><br /><code className="muted">--ds-line-height-{p.lh}</code></td>
              <td>
                <div
                  className="dsdoc-specimen dsdoc-lh"
                  style={{ fontSize: `var(--ds-font-size-${p.size})`, lineHeight: `var(--ds-line-height-${p.lh})`, ['--lh' as string]: `${p.lh}px` }}
                >
                  Pending withdrawals
                </div>
              </td>
              <td className="muted" style={{ maxWidth: 320 }}>{p.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Doc>
  );
}

/* ---------- Component tokens ---------- */
export function ComponentPreview({ name }: { name: 'Size [Button]' | 'Size [Input]' | 'Size [Table]' | 'Size [Badge]' | 'Shape [Badge]' }) {
  const col = collection(name);
  return (
    <Doc>
      <div className="dsdoc-row">
        {col.modes.map((m, i) => {
          const attr = { [col.modeAttribute!]: col.modeValues![i] } as Record<string, string>;
          let el: ReactNode;
          if (name === 'Size [Button]') {
            const iconOnly = /Icons only/.test(m);
            el = <span className="dsdoc-btn" {...attr}><span className="ic" />{iconOnly ? null : 'Approve'}</span>;
          } else if (name === 'Size [Input]') {
            el = <span className="dsdoc-input" {...attr}><span className="ic" />Search by wallet ID</span>;
          } else if (name === 'Size [Table]') {
            el = (
              <div className="dsdoc-tablerow" {...attr}>
                <div className="h">Customer</div><div className="h">Asset</div><div className="h">Amount</div>
                <div>Anna Petrosyan</div><div>USDT</div><div className="mono">1,250.00</div>
              </div>
            );
          } else {
            el = <span className="dsdoc-badge" data-context="positive" data-appearance="outlined" {...attr}><span className="ic" />Verified</span>;
          }
          return (
            <div key={m}>
              {el}
              <code className="cap">{col.modeAttribute}="{col.modeValues![i]}"{m === col.defaultMode ? ' (default)' : ''}</code>
            </div>
          );
        })}
      </div>
    </Doc>
  );
}
