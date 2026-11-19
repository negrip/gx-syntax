// Tokeniza los .gx de samples/ con la gramatica y verifica scopes esperados.
// Uso: node scripts/tokenize-check.js            -> corre las verificaciones
//      node scripts/tokenize-check.js dump FILE  -> imprime tokens de un archivo
const fs = require('fs');
const path = require('path');
const vsctm = require('vscode-textmate');
const oniguruma = require('vscode-oniguruma');

const root = path.join(__dirname, '..');
const wasm = fs.readFileSync(path.join(root, 'node_modules', 'vscode-oniguruma', 'release', 'onig.wasm')).buffer;
const onigLib = oniguruma.loadWASM(wasm).then(() => ({
  createOnigScanner: (p) => new oniguruma.OnigScanner(p),
  createOnigString: (s) => new oniguruma.OnigString(s),
}));

const registry = new vsctm.Registry({
  onigLib,
  loadGrammar: async (scope) => {
    if (scope !== 'source.gx') return null; // markdown embebido no se resuelve aca
    const content = fs.readFileSync(path.join(root, 'syntaxes', 'gx.tmLanguage.json'), 'utf8');
    return vsctm.parseRawGrammar(content, 'gx.tmLanguage.json');
  },
});

async function tokenize(file) {
  const grammar = await registry.loadGrammar('source.gx');
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let stack = vsctm.INITIAL;
  const out = [];
  lines.forEach((line, i) => {
    const r = grammar.tokenizeLine(line, stack);
    stack = r.ruleStack;
    r.tokens.forEach((t) => out.push({ line: i + 1, text: line.slice(t.startIndex, t.endIndex), scopes: t.scopes }));
  });
  return out;
}

// [archivo, texto del token, fragmento de scope esperado]
// Los delimitadores de strings y comentarios son tokens aparte: 'abc' produce el token abc.
const EXPECT = [
  // ProductSelector.gx (DataSelector)
  ['ProductSelector.gx', 'DataSelector', 'storage.type.class'],
  ['ProductSelector.gx', 'Parameters', 'keyword.control.section'],
  ['ProductSelector.gx', '&ProductID', 'variable.other.declaration'],
  ['ProductSelector.gx', 'ProductID', 'variable.other.constant.attribute'],
  ['ProductSelector.gx', '&ProductID', 'variable.other'],
  ['ProductSelector.gx', 'when', 'keyword.control'],
  ['ProductSelector.gx', 'Orders', 'keyword.control.section'],
  ['ProductSelector.gx', 'ProductName', 'variable.other.constant.attribute'],
  ['ProductSelector.gx', 'DefinedBy', 'keyword.control.section'],

  // Customer.gx (Transaction)
  ['Customer.gx', 'Transaction', 'storage.type.class'],
  ['Customer.gx', 'Customer', 'entity.name.type.class'],
  ['Customer.gx', 'CustomerId', 'variable.other.constant.attribute'],
  ['Customer.gx', 'CustomerName', 'variable.other.constant.attribute'],
  ['Customer.gx', '*', 'key-marker'],
  ['Customer.gx', '!', 'key-marker'],
  ['Customer.gx', 'DataType', 'variable.other.property'],
  ['Customer.gx', 'Numeric(8.0)', 'string.quoted.single'],
  ['Customer.gx', 'Rules', 'keyword.control.section'],
  ['Customer.gx', ' Validations ', 'comment.block'],
  ['Customer.gx', 'web', 'entity.other.attribute-name.platform'],
  ['Customer.gx', 'noaccept', 'support.function.rule'],
  ['Customer.gx', 'error', 'support.function.rule'],
  ['Customer.gx', 'Name is required', 'string.quoted.double'],
  ['Customer.gx', 'IsEmpty', 'entity.name.function.method'],
  ['Customer.gx', 'Event', 'keyword.control.declaration'],
  ['Customer.gx', ' Start', 'entity.name.function.event'],
  ['Customer.gx', ' After Trn', 'entity.name.function.event'],
  ['Customer.gx', 'If', 'keyword.control'],
  ['Customer.gx', 'not', 'keyword.operator.word'],
  ['Customer.gx', 'IsAuthorized', 'support.function.builtin'],
  ['Customer.gx', '&PgmName', 'variable.other'],
  ['Customer.gx', 'Endif', 'keyword.control'],
  ['Customer.gx', '// Nothing else to do', 'comment.line'],
  ['Customer.gx', 'Return', 'keyword.control'],
  ['Customer.gx', 'Variables', 'keyword.control.section'],
  ['Customer.gx', 'PgmName', 'variable.other.declaration'],
  ['Customer.gx', 'Documentation', 'keyword.control.section'],
  ['Customer.gx', 'Properties', 'keyword.control.section'],
  ['Customer.gx', 'BusinessComponent', 'variable.other.property'],
  ['Customer.gx', 'True', 'string.quoted.double'],

  // ProductList.gx (WebPanel)
  ['ProductList.gx', 'WebPanel', 'storage.type.class'],
  ['ProductList.gx', 'in', 'parameter-direction'],
  ['ProductList.gx', 'out', 'parameter-direction'],
  ['ProductList.gx', '&CategoryId', 'variable.other'],
  ['ProductList.gx', 'order', 'support.function.rule'],
  ['ProductList.gx', 'ProductName', 'variable.other.constant.attribute'],
  ['ProductList.gx', 'Format', 'support.function.builtin'],
  ['ProductList.gx', '!"', 'string.quoted.double.nontranslatable'],
  ['ProductList.gx', 'Do', 'keyword.control'],
  ['ProductList.gx', "'LoadTotals'", 'entity.name.function.subroutine'],
  ['ProductList.gx', " 'Toggle'", 'entity.name.function.event'],
  ['ProductList.gx', ' Grid.Load', 'entity.name.function.event'],
  ['ProductList.gx', 'StyleClass', 'support.class'],
  ['ProductList.gx', 'Collapsed', 'support.constant.enum'],
  ['ProductList.gx', 'Do Case', 'keyword.control'],
  ['ProductList.gx', 'Case', 'keyword.control'],
  ['ProductList.gx', 'Otherwise', 'keyword.control'],
  ['ProductList.gx', 'EndCase', 'keyword.control'],
  ['ProductList.gx', 'For Each', 'keyword.control'],
  ['ProductList.gx', 'Where', 'keyword.control'],
  ['ProductList.gx', 'EndFor', 'keyword.control'],
  ['ProductList.gx', 'EndSub', 'keyword.control'],
  ['ProductList.gx', '+=', 'keyword.operator'],
  ['ProductList.gx', '0', 'constant.numeric'],
  ['ProductList.gx', 'Conditions', 'keyword.control.section'],
  ['ProductList.gx', 'LIKE', 'keyword.operator.word'],
  ['ProductList.gx', 'when', 'keyword.control'],
  ['ProductList.gx', 'Total', 'variable.other.declaration'],
  ['ProductList.gx', 'Attribute:CategoryId', 'string.quoted.single'],
  ['ProductList.gx', 'Description', 'variable.other.property'],

  // CalcTotal.gx (Procedure, cuerpo de codigo)
  ['CalcTotal.gx', 'Procedure', 'storage.type.class'],
  ['CalcTotal.gx', 'New', 'keyword.control'],
  ['CalcTotal.gx', 'Round', 'support.function.builtin'],
  ['CalcTotal.gx', 'Msg', 'support.function.rule'],
  ['CalcTotal.gx', 'Amount', 'variable.other.property'],
  ['CalcTotal.gx', '&Today', 'variable.other'],
  ['CalcTotal.gx', 'InvoiceLineAmount', 'variable.other.constant.attribute'],
  ['CalcTotal.gx', '2', 'constant.numeric'],

  // Invoice.gx (Table con #Indexes)
  ['Invoice.gx', 'Table', 'storage.type.class'],
  ['Invoice.gx', 'InvoiceDate', 'variable.other.constant.attribute'],
  ['Invoice.gx', 'Indexes', 'keyword.control.section'],
  ['Invoice.gx', 'IInvoice', 'variable.other.constant.attribute'],
  ['Invoice.gx', 'Source', 'variable.other.property'],
  ['Invoice.gx', 'Primary Key', 'string.quoted.single'],
];

(async () => {
  if (process.argv[2] === 'dump') {
    for (const t of await tokenize(process.argv[3])) {
      if (t.text.trim()) console.log(`${String(t.line).padStart(3)}  ${JSON.stringify(t.text).padEnd(40)} ${t.scopes.slice(1).join(' ')}`);
    }
    return;
  }
  const cache = {};
  let fail = 0;
  for (const [file, text, scope] of EXPECT) {
    cache[file] = cache[file] || (await tokenize(path.join(root, 'samples', file)));
    const hit = cache[file].find((t) => t.text === text && t.scopes.some((s) => s.includes(scope)));
    if (!hit) {
      fail++;
      const seen = cache[file].filter((t) => t.text === text).map((t) => t.scopes.slice(1).join(' '));
      console.log(`FAIL ${file}: ${JSON.stringify(text)} esperaba "${scope}" -> ${seen.slice(0, 2).join(' | ') || '(token no encontrado)'}`);
    }
  }
  console.log(fail ? `${fail} fallas de ${EXPECT.length}` : `OK: ${EXPECT.length} verificaciones`);
  process.exit(fail ? 1 : 0);
})();
