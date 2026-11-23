'use strict';
// Pruebas del analizador de secciones (src/sections.js) sobre los samples.
const fs = require('fs');
const path = require('path');
const { parseSections } = require('../src/sections');

const read = (f) => fs.readFileSync(path.join(__dirname, '..', 'samples', f), 'utf8');
const summary = (f) =>
  parseSections(read(f)).map((s) => [s.name, ...s.children.map((c) => `${c.kind}:${c.name}`)].join('|'));

const CASES = [
  ['Customer.gx', ['Rules', 'Events|Event:Start|Event:After', 'Variables', 'Documentation', 'Properties']],
  ['ProductList.gx', ['Rules', "Events|Event:Start|Event:'Toggle'|Event:Grid.Load|Sub:'LoadTotals'", 'Conditions', 'Variables', 'Properties']],
  ['ProductSelector.gx', ['Parameters', 'Conditions', 'Orders', 'DefinedBy', 'Properties']],
];

let fail = 0;
for (const [file, expected] of CASES) {
  const got = summary(file);
  if (JSON.stringify(got) !== JSON.stringify(expected)) {
    fail++;
    console.log(`FALLA ${file}\n  esperado: ${JSON.stringify(expected)}\n  obtenido: ${JSON.stringify(got)}`);
  }
}
// Casos borde: sección sin #End y #Documentation no genera Events falsos
const open = parseSections('Procedure P\n{\n#Events\nEvent Start\n  x\n');
if (open.length !== 1 || open[0].children.length !== 1) { fail++; console.log('FALLA: sección sin #End'); }
const doc = parseSections('Procedure P\n{\n#Documentation\nEvent Start de ejemplo\n#End\n}');
if (doc.length !== 1 || doc[0].children.length !== 0) { fail++; console.log('FALLA: #Documentation'); }

// Símbolos para el autocompletado
const { collectSymbols } = require('../src/symbols');
const src = [
  'WebPanel P', '{',
  '\t#Rules', '\t\tparm(out:&pCountryId);', '\t\t&pC', '\t#End',
  '\t#Variables', "\t\tcName [ DataType = 'VarChar(64)' ]", '\t#End',
  '}',
].join('\n');
const sym = collectSymbols(src, { line: 4, start: 2, end: 5 });
const vn = [...sym.variables.keys()];
for (const n of ['pCountryId', 'cName', 'Today', 'Pgmname']) if (!vn.includes(n)) { fail++; console.log('FALLA: falta variable ' + n); }
if (vn.includes('pC')) { fail++; console.log('FALLA: se sugiere a sí misma'); }
if (sym.variables.get('cName').detail !== 'VarChar(64)') { fail++; console.log('FALLA: detalle de tipo'); }
const cust = collectSymbols(read('Customer.gx'));
if (![...cust.attributes.keys()].includes('CustomerId')) { fail++; console.log('FALLA: atributos'); }

if (fail) process.exit(1);
console.log(`OK: ${CASES.length + 6} verificaciones de secciones y símbolos`);
