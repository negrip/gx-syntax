'use strict';
// Modelo del árbol de objetos: a partir de lo que devuelve scanKb arma nodos con
// id estable y padre (para poder revelar el archivo activo) y la lista de búsqueda.
// JS puro (sin vscode), para probarlo con node.

const path = require('path');

// Un nodo del modelo: { id, raw, parent, kind, label, children }
function wrap(raw, parent, prefix) {
  const key = raw.file || raw.path || `${parent ? parent.id : ''}/${raw.name}`;
  const model = {
    id: `${prefix}${raw.kind}:${key}:${raw.name}`,
    raw,
    parent,
    kind: raw.kind,
    label: raw.name,
    children: [],
  };
  model.children = (raw.children || []).map((c) => wrap(c, model, prefix));
  return model;
}

// kbs: resultados de scanKb. Devuelve:
//   top:     nodos de primer nivel (uno por raíz de KB)
//   byFile:  archivo (minúsculas) -> nodo del árbol, para revelar el archivo activo
//   search:  [{ name, type, file, relative, root }] ordenado por nombre
function buildModels(kbs) {
  const top = [];
  const byFile = new Map();
  const search = [];

  const index = (model) => {
    if (model.kind === 'object' && model.raw.file) byFile.set(model.raw.file.toLowerCase(), model);
    model.children.forEach(index);
  };

  for (const kb of kbs) {
    const root = {
      id: `root:${kb.path}`,
      raw: kb,
      parent: null,
      kind: 'root',
      label: kb.name,
      children: [],
    };
    const tree = kb.children.map((c) => wrap(c, root, ''));
    tree.forEach(index);
    root.children = tree;

    if (kb.mainPrograms.length) {
      const main = { id: `main:${kb.path}`, raw: { kind: 'main', name: 'Main Programs' }, parent: root, kind: 'main', label: 'Main Programs', children: [] };
      main.children = kb.mainPrograms.map((o) => wrap({ ...o, children: [] }, main, 'main:'));
      root.children = [main, ...tree];
    }
    top.push(root);

    for (const o of kb.objects) {
      search.push({ name: o.name, type: o.type, file: o.file, relative: path.relative(kb.path, o.file), root: kb.name });
    }
  }
  search.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  return { top, byFile, search };
}

module.exports = { buildModels };
