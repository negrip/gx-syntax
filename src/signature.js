'use strict';
// Ayuda de firma: dado el texto anterior al cursor, encuentra la llamada abierta más
// interna ("StrSearch(&a, " -> función StrSearch, parámetro activo 1) y arma la firma a
// mostrar. JS puro (sin vscode) para poder probarlo con node.

const { FUNCTIONS, METHODS, signatureLabel, paramLabel } = require('./catalog');

// Recorre el texto hacia adelante, ignorando strings y comentarios, y devuelve la
// llamada sin cerrar más interna: { name, isMethod, activeParam } o null.
function findCall(text) {
  const stack = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '/' && next === '/') { // comentario de línea
      while (i < n && text[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && next === '*') { // comentario de bloque
      const end = text.indexOf('*/', i + 2);
      if (end === -1) return null; // el cursor está dentro de un comentario
      i = end + 2;
      continue;
    }
    if (c === '"' || c === "'") { // string: se cierra en la misma línea
      let j = i + 1;
      while (j < n && text[j] !== c && text[j] !== '\n') j++;
      if (j >= n) return null; // el cursor está dentro de un string
      if (text[j] === '\n') { i = j; continue; } // string sin cerrar: se ignora
      i = j + 1;
      continue;
    }
    if (c === '(') {
      const before = text.slice(0, i).replace(/\s+$/, '');
      const m = /([A-Za-z_]\w*)$/.exec(before);
      stack.push({
        name: m ? m[1] : '',
        isMethod: m ? before[before.length - m[1].length - 1] === '.' : false,
        commas: 0,
      });
    } else if (c === ')') {
      stack.pop();
    } else if (c === ',' && stack.length) {
      stack[stack.length - 1].commas++;
    }
    i++;
  }
  for (let k = stack.length - 1; k >= 0; k--) {
    if (stack[k].name) return { name: stack[k].name, isMethod: stack[k].isMethod, activeParam: stack[k].commas };
  }
  return null;
}

const byName = (list, name) => list.find((e) => e.name.toLowerCase() === name.toLowerCase());

// Devuelve { label, parameters: [string], activeParameter, url? } o null si no hay firma conocida.
function signatureFor(call) {
  if (!call) return null;
  if (!call.isMethod) {
    const f = byName(FUNCTIONS, call.name);
    if (!f) return null;
    if (f.typed) {
      const params = f.typed.params;
      return {
        label: signatureLabel(f.typed),
        parameters: params.map(paramLabel),
        activeParameter: clamp(call.activeParam, params),
        url: f.typed.url,
      };
    }
    return fromLine(f, call);
  }
  const m = byName(METHODS, call.name);
  return m ? fromLine(m, call) : null;
}

function fromLine(entry, call) {
  const labels = entry.params.map((q) => (q.optional ? `[${q.name}]` : q.name));
  return {
    label: `${entry.name}(${labels.join(', ')})`,
    parameters: labels,
    activeParameter: clamp(call.activeParam, entry.params),
  };
}

// Con parámetros variables ("rest"), el último sigue activo aunque haya más comas.
// Si sobran argumentos y no hay "rest", el índice queda fuera de rango: no se resalta ninguno.
function clamp(index, params) {
  if (!params.length) return 0;
  const last = params[params.length - 1];
  return index >= params.length && last.rest ? params.length - 1 : index;
}

module.exports = { findCall, signatureFor };
