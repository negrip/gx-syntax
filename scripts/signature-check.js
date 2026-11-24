'use strict';
// Pruebas de la ayuda de firma (src/signature.js) y de la integridad del catálogo.
const { findCall, signatureFor } = require('../src/signature');
const { FUNCTIONS, METHODS, SIGNATURES } = require('../src/catalog');

let fail = 0;
let total = 0;
const check = (ok, msg) => { total++; if (!ok) { fail++; console.log(`FALLA: ${msg}`); } };

// [texto antes del cursor, etiqueta esperada, parámetro activo esperado]
const CASES = [
  ['&x = StrSearch(', 'StrSearch(String: Character, SubString: Character, [Start: Numeric]): Numeric', 0],
  ['StrSearch(&a, ', 'StrSearch(String: Character, SubString: Character, [Start: Numeric]): Numeric', 1],
  ['&n = Len(Trim(&a), ', 'Len(Str: Character): Numeric', 1], // Trim ya cerró: vuelve a Len
  ['Len(Trim(&a)', 'Len(Str: Character): Numeric', 0],
  ['Iif(&a = 1, "x,y", ', 'Iif(Expression: Boolean, TruePart, FalsePart)', 2], // la coma del string no cuenta
  ["Iif(&a = 1, 'x,y', ", 'Iif(Expression: Boolean, TruePart, FalsePart)', 2],
  ['// Len(\nTrim(', 'Trim(Str: Character): Character', 0], // comentario ignorado
  ['/* Len( */ Trim(', 'Trim(Str: Character): Character', 0],
  ['Format(&s, &a, &b, &c', 'Format(Str: Character, [Value: Character...]): Character', 1], // parámetro variable
  ['&d = Today(', 'Today(): Date', 0],
  ['&t.Substring(1, ', 'Substring(start, [length])', 1], // método
  ['&c.Sort(', 'Sort([criteria])', 0],
];
for (const [text, label, active] of CASES) {
  const sig = signatureFor(findCall(text));
  check(sig && sig.label === label, `etiqueta de ${JSON.stringify(text)} -> ${sig && sig.label}`);
  check(sig && sig.activeParameter === active, `parámetro activo de ${JSON.stringify(text)} -> ${sig && sig.activeParameter}`);
}
// Sin firma: función desconocida, dentro de un string, dentro de un comentario, llamada ya cerrada
for (const text of ['x = MiProcedure(1', 'Msg("Len(', '// Len(', 'Len(&a)']) {
  check(signatureFor(findCall(text)) === null, `no debe haber firma para ${JSON.stringify(text)}`);
}
// Sobran argumentos y no hay "rest": ningún parámetro queda resaltado (fuera de rango)
const extra = signatureFor(findCall('StrSearch(&a, &b, 3, 4'));
check(extra && extra.activeParameter >= extra.parameters.length, 'argumentos de más');

// Integridad del catálogo
const dup = (list, what) => {
  const seen = new Set();
  for (const e of list) {
    const k = e.name.toLowerCase();
    check(!seen.has(k), `${what} repetido: ${e.name}`);
    seen.add(k);
  }
};
dup(FUNCTIONS, 'función');
dup(METHODS, 'método');
dup(SIGNATURES, 'firma');
for (const s of SIGNATURES) {
  check(/^https:\/\/docs\.genexus\.com\//.test(s.url || ''), `${s.name}: falta la URL de la wiki`);
  check(FUNCTIONS.some((f) => f.name === s.name), `${s.name}: no está en el catálogo de funciones`);
}
check(!FUNCTIONS.some((f) => f.name === 'AddDays'), 'AddDays es solo método en la wiki');
check(METHODS.some((m) => m.name === 'AddDays'), 'falta el método AddDays');

if (fail) process.exit(1);
console.log(`OK: ${total} verificaciones de firmas y catálogo`);
