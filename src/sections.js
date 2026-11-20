'use strict';
// Análisis de la estructura de un .gx: secciones (#Rules ... #End) y, dentro de ellas,
// Event/Sub. Es JS puro (sin vscode) para poder probarlo con node.

const SECTION_RE = /^\s*#([A-Za-z]\w*)\s*$/;
const END_RE = /^\s*#end\b/i;
const EVENT_RE = /^\s*event\s+('[^']*'|[A-Za-z_][\w.]*)/i;
const SUB_RE = /^\s*sub\s+('[^']*'|[A-Za-z_]\w*)/i;
const ENDEVENT_RE = /^\s*endevent\b/i;
const ENDSUB_RE = /^\s*endsub\b/i;

// Devuelve [{ name, startLine, endLine, children: [{ kind, name, startLine, endLine }] }]
function parseSections(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let cur = null;
  let child = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!cur) {
      const m = SECTION_RE.exec(line);
      if (m && m[1].toLowerCase() !== 'end') cur = { name: m[1], startLine: i, endLine: i, children: [] };
      continue;
    }
    if (END_RE.test(line)) {
      if (child) { child.endLine = i - 1; child = null; }
      cur.endLine = i;
      sections.push(cur);
      cur = null;
      continue;
    }
    if (cur.name.toLowerCase() === 'documentation') continue;
    if (child) {
      if ((child.kind === 'Event' && ENDEVENT_RE.test(line)) || (child.kind === 'Sub' && ENDSUB_RE.test(line))) {
        child.endLine = i;
        child = null;
      }
      continue;
    }
    let m = EVENT_RE.exec(line);
    if (m) { child = { kind: 'Event', name: m[1], startLine: i, endLine: i }; cur.children.push(child); continue; }
    m = SUB_RE.exec(line);
    if (m) { child = { kind: 'Sub', name: m[1], startLine: i, endLine: i }; cur.children.push(child); }
  }
  if (cur) { // sección sin #End (archivo en edición)
    if (child) child.endLine = lines.length - 1;
    cur.endLine = lines.length - 1;
    sections.push(cur);
  }
  return sections;
}

module.exports = { parseSections };
