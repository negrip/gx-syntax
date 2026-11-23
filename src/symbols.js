'use strict';
// Símbolos del objeto abierto para el autocompletado: variables y atributos declarados,
// y variables usadas con & en el código. JS puro (sin vscode) para poder probarlo.

const SECTION_RE = /^\s*#([A-Za-z]\w*)\s*$/;
const END_RE = /^\s*#end\b/i;
const DECL_RE = /^\s*(&?)([A-Za-z_]\w*)([*!]?)\s*\[(.*)$/;
const USE_RE = /&([A-Za-z_]\w*)/g;

// Variables del sistema que GeneXus ofrece siempre en el editor.
const SYSTEM_VARIABLES = [
  ['Today', 'Date'],
  ['Time', 'Character'],
  ['Pgmname', 'Character'],
  ['Pgmdesc', 'Character'],
];

// text: contenido del .gx. cursor: { line, start, end } del fragmento que se está escribiendo
// (se excluye para que "&pC" a medio tipear no se sugiera a sí mismo).
function collectSymbols(text, cursor) {
  const lines = text.split(/\r?\n/);
  if (cursor && lines[cursor.line] !== undefined) {
    const l = lines[cursor.line];
    lines[cursor.line] = l.slice(0, cursor.start) + l.slice(cursor.end);
  }
  const variables = new Map(); // nombre -> { detail }
  const attributes = new Map();
  let section = null;
  for (const line of lines) {
    const sec = SECTION_RE.exec(line);
    if (!section && sec && sec[1].toLowerCase() !== 'end') { section = sec[1].toLowerCase(); continue; }
    if (section && END_RE.test(line)) { section = null; continue; }
    const m = DECL_RE.exec(line);
    if (m) {
      const dt = /DataType\s*=\s*'([^']*)'/.exec(m[4]);
      const detail = dt ? dt[1] : '';
      if (section === 'variables' || section === 'parameters') variables.set(m[2], { detail });
      else if (!section) attributes.set(m[2], { detail });
    }
    if (section !== 'documentation') {
      let u;
      USE_RE.lastIndex = 0;
      while ((u = USE_RE.exec(line))) if (!variables.has(u[1])) variables.set(u[1], { detail: '' });
    }
  }
  const known = new Set([...variables.keys()].map((k) => k.toLowerCase()));
  for (const [name, detail] of SYSTEM_VARIABLES) if (!known.has(name.toLowerCase())) variables.set(name, { detail, system: true });
  return { variables, attributes };
}

module.exports = { collectSymbols };
