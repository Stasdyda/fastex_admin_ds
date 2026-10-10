// Exports every local variable in the open Figma file in the format of tokens/figma-variables.json.
// Run it with the Figma MCP server's use_figma tool, or paste it into a development plugin.
// The return value is the "collections" object; keep "meta" from the existing JSON and update exportedAt.
// Large files may exceed a 20 KB return limit: pass a subset of collection names in ONLY to export in parts.
const SKIP = ['Workbook · spacing'];
const ONLY = null; // e.g. ['Colors', 'Tokens']

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const byId = Object.fromEntries(cols.map((c) => [c.id, c]));
const hex = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
async function encode(val) {
  if (val && val.type === 'VARIABLE_ALIAS') {
    const a = await figma.variables.getVariableByIdAsync(val.id);
    return '@' + byId[a.variableCollectionId].name + ':' + a.name;
  }
  if (val && typeof val === 'object' && 'r' in val) return '#' + hex(val.r) + hex(val.g) + hex(val.b) + (val.a < 1 ? hex(val.a) : '');
  return val;
}
const out = {};
for (const c of cols) {
  if (SKIP.includes(c.name) || (ONLY && !ONLY.includes(c.name))) continue;
  const vars = [];
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    const values = [];
    for (const m of c.modes) values.push(await encode(v.valuesByMode[m.modeId]));
    const row = [v.name, v.resolvedType[0], values.length === 1 ? values[0] : values];
    if (v.description) row.push(v.description);
    vars.push(row);
  }
  out[c.name] = { modes: c.modes.map((m) => m.name), vars };
}
return out;
