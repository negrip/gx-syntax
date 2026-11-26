'use strict';
// Índice de objetos GeneXus a partir de los .gx de una carpeta, y el árbol que los organiza
// como el KB Explorer de la IDE. JS puro (sin vscode): solo lee archivos, y se prueba con node.
//
// Reglas (inferidas de la estructura que exporta la KB):
//  - Una carpeta con module.toml es un módulo; el resto de las carpetas son carpetas.
//  - Las carpetas que empiezan con "#" (#attributes, #tables, ...) no se muestran, salvo
//    que #tables sirve para encontrar las tablas asociadas de cada Transacción.
//  - Una carpeta con el mismo nombre que un objeto vecino (City.gx + City/) cuelga de ese objeto.
//  - El tipo y el nombre salen de la primera línea del .gx ("Transaction Customer").
//  - MainProgram = "True" en #Properties marca los programas principales.

const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = new Set(['node_modules']);
const MAX_FILE_BYTES = 512 * 1024; // un .gx más grande se lee solo en parte
const HEADER_RE = /^\s*([A-Za-z]\w*)(?:[ \t]+([A-Za-z_][\w.]*))?/;
const MAIN_RE = /MainProgram\s*=\s*"True"/i;

// Categorías "#..." cuyos objetos la IDE muestra dentro del módulo (dominios, imágenes, ...).
// Las demás (#attributes, #tables, #preferences, #localization, #patternsettings, #categories,
// #documentation) son configuración del modelo o se muestran de otra forma, y no se listan.
const SHOWN_CATEGORIES = new Set(['#subtypes', '#domains', '#images', '#files', '#dataviews', '#themes', '#designsystems']);
// Archivos de configuración local de cada máquina (pueden traer credenciales): nunca se leen.
const LOCAL_FILE_RE = /\.local\.(?:[^./\\]+\.)?gx$|\.local\.gx$/i;
const isGxFile = (e) => e.isFile() && /\.gx$/i.test(e.name) && !LOCAL_FILE_RE.test(e.name);

const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
// Orden de la IDE: Associated Tables, módulos, carpetas y por último los objetos.
const RANK = { group: 0, module: 1, folder: 2, object: 3 };

async function exists(p) {
  try { await fs.promises.access(p); return true; } catch { return false; }
}

async function readEntries(dir) {
  try { return await fs.promises.readdir(dir, { withFileTypes: true }); } catch { return []; }
}

async function readObject(file) {
  const base = path.basename(file, '.gx');
  let text = '';
  try {
    const fh = await fs.promises.open(file, 'r');
    try {
      const { size } = await fh.stat();
      const len = Math.min(size, MAX_FILE_BYTES);
      const buf = Buffer.alloc(len);
      await fh.read(buf, 0, len, 0);
      text = buf.toString('utf8');
    } finally {
      await fh.close();
    }
  } catch {
    return { kind: 'object', type: 'Unknown', name: base, file, mainProgram: false, children: [] };
  }
  const first = text.split(/\r?\n/).find((l) => l.trim() !== '') || '';
  const m = HEADER_RE.exec(first);
  return {
    kind: 'object',
    type: m ? m[1] : 'Unknown',
    name: m && m[2] ? m[2] : base,
    file,
    mainProgram: MAIN_RE.test(text),
    children: [],
  };
}

async function moduleName(dir) {
  try {
    const toml = await fs.promises.readFile(path.join(dir, 'module.toml'), 'utf8');
    const m = /^\s*Name\s*=\s*"([^"]*)"/m.exec(toml);
    if (m) return m[1];
  } catch { /* sin module.toml legible: se usa el nombre de la carpeta */ }
  return path.basename(dir);
}

// Escanea la raíz de una KB y devuelve { kind:'root', name, path, children, objects, mainPrograms, truncated }.
async function scanKb(root, { maxFiles = 20000 } = {}) {
  const state = { count: 0, truncated: false, objects: [] };

  // Tablas de #tables: nombre -> objeto (para "Associated Tables")
  const tables = new Map();
  for (const e of await readEntries(path.join(root, '#tables'))) {
    if (isGxFile(e)) {
      const obj = await readObject(path.join(root, '#tables', e.name));
      tables.set(obj.name.toLowerCase(), obj);
    }
  }

  async function walk(dir, isModule) {
    const entries = await readEntries(dir);
    const objects = [];
    const folders = [];
    const files = entries.filter(isGxFile).map((e) => path.join(dir, e.name));
    const dirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith('#') && !e.name.startsWith('.') && !IGNORED_DIRS.has(e.name));

    // Los objetos de las categorías #domains, #images, ... pertenecen a este módulo.
    for (const c of entries.filter((e) => e.isDirectory() && SHOWN_CATEGORIES.has(e.name.toLowerCase()))) {
      const catDir = path.join(dir, c.name);
      for (const e of (await readEntries(catDir)).filter(isGxFile)) files.push(path.join(catDir, e.name));
    }

    const room = maxFiles - state.count;
    if (files.length > room) state.truncated = true;
    const take = files.slice(0, Math.max(room, 0));
    state.count += take.length;
    for (const o of await Promise.all(take.map((f) => readObject(f)))) {
      objects.push(o);
      state.objects.push(o);
    }

    for (const d of dirs) {
      if (state.count >= maxFiles) { state.truncated = true; break; }
      const full = path.join(dir, d.name);
      const hasToml = await exists(path.join(full, 'module.toml'));
      folders.push({
        kind: hasToml ? 'module' : 'folder',
        // "@Nombre" es una carpeta de la IDE: se muestra sin la arroba
        name: hasToml ? await moduleName(full) : d.name.replace(/^@/, ''),
        dirName: d.name,
        path: full,
        children: await walk(full, hasToml),
      });
    }

    // Una carpeta con el nombre de un objeto vecino cuelga de ese objeto.
    const objByKey = new Map();
    for (const o of objects) {
      objByKey.set(o.name.toLowerCase(), o);
      objByKey.set(path.basename(o.file, '.gx').toLowerCase(), o);
    }
    const remaining = [];
    for (const f of folders) {
      const owner = objByKey.get(f.dirName.toLowerCase());
      if (owner) owner.children.push(...f.children);
      else remaining.push(f);
    }

    // Tablas asociadas de las Transacciones
    for (const o of objects) {
      const t = o.type === 'Transaction' ? tables.get(o.name.toLowerCase()) : null;
      if (t) o.children.unshift({ kind: 'group', name: 'Associated Tables', children: [{ ...t, children: [] }] });
    }

    return sortNodes([...remaining, ...objects]);
  }

  const children = await walk(root, false);
  return {
    kind: 'root',
    name: path.basename(root),
    path: root,
    children,
    objects: state.objects,
    mainPrograms: state.objects.filter((o) => o.mainProgram).sort(byName),
    truncated: state.truncated,
  };
}

// Como la IDE: Associated Tables, módulos, carpetas y objetos; dentro de cada grupo, por nombre.
function sortNodes(nodes) {
  for (const n of nodes) if (n.children && n.children.length) n.children = sortNodes(n.children);
  return nodes.sort((a, b) => (RANK[a.kind] ?? 3) - (RANK[b.kind] ?? 3) || byName(a, b));
}

// ---- Detección de raíces ----

async function isRootDir(dir) {
  if (['src', 'ref'].includes(path.basename(dir).toLowerCase())) return true;
  return (await exists(path.join(dir, '#attributes'))) || (await exists(path.join(dir, '#tables')));
}

async function subdirs(dir) {
  return (await readEntries(dir))
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('#') && !IGNORED_DIRS.has(e.name))
    .map((e) => path.join(dir, e.name));
}

// ¿Hay algún .gx dentro de dir (hasta cierta profundidad)?
async function hasGx(dir, depth) {
  const entries = await readEntries(dir);
  if (entries.some((e) => e.isFile() && e.name.toLowerCase().endsWith('.gx'))) return true;
  if (depth <= 0) return false;
  for (const d of await subdirs(dir)) if (await hasGx(d, depth - 1)) return true;
  return false;
}

// Dada una carpeta abierta en el editor, devuelve las raíces de KB que contiene
// (ella misma, o carpetas src/ref/con #attributes hasta dos niveles más abajo).
// Si no hay ninguna pero hay .gx cerca, la carpeta misma hace de raíz.
async function detectRoots(folder) {
  if (await isRootDir(folder)) return [folder];
  const found = [];
  async function look(dir, depth) {
    for (const d of await subdirs(dir)) {
      if (await isRootDir(d)) found.push(d);
      else if (depth > 1) await look(d, depth - 1);
    }
  }
  await look(folder, 2);
  if (found.length) return found;
  return (await hasGx(folder, 4)) ? [folder] : [];
}

module.exports = { scanKb, detectRoots };
