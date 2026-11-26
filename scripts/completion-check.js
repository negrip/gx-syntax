'use strict';
// Prueba el proveedor de autocompletado de src/extension.js con un "vscode" simulado,
// para detectar regresiones sin abrir VS Code (por ejemplo, expresiones regulares rotas).
const Module = require('module');
const path = require('path');

let provider;
class CompletionItem { constructor(label, kind) { this.label = label; this.kind = kind; } }
const vscode = {
  CompletionItem,
  SnippetString: class { constructor(value) { this.value = value; } },
  MarkdownString: class { constructor(value) { this.value = value; } },
  CompletionItemKind: { Method: 'method', Property: 'property', Variable: 'variable', Field: 'field', Function: 'function' },
  Range: class {}, Position: class {}, Selection: class {}, TextEditorRevealType: {}, SymbolKind: {},
  EventEmitter: class { constructor() { this.event = () => ({}); } fire() {} },
  TreeItem: class {}, ThemeIcon: class {}, Uri: { file: (f) => ({ fsPath: f }) },
  TreeItemCollapsibleState: { None: 0, Collapsed: 1 },
  commands: { registerCommand: () => ({}), executeCommand: async () => undefined },
  languages: {
    registerCompletionItemProvider: (_s, p) => { provider = p; return {}; },
    registerSignatureHelpProvider: () => ({}),
    registerDocumentSymbolProvider: () => ({}),
  },
  window: {
    createTreeView: () => ({ visible: false, onDidChangeVisibility: () => ({}), reveal: async () => {} }),
    onDidChangeActiveTextEditor: () => ({}),
  },
  workspace: {
    workspaceFolders: [],
    getConfiguration: () => ({ get: (_k, d) => d }),
    createFileSystemWatcher: () => ({ onDidCreate() {}, onDidDelete() {}, onDidChange() {}, dispose() {} }),
    onDidChangeWorkspaceFolders: () => ({}),
    onDidChangeConfiguration: () => ({}),
  },
};
const load = Module._load;
Module._load = function (request, ...rest) {
  return request === 'vscode' ? vscode : load.call(this, request, ...rest);
};
require(path.join(__dirname, '..', 'src', 'extension.js')).activate({ subscriptions: [] });

// Documento de una línea más el texto completo (para variables/atributos)
const complete = (line, fullText) =>
  provider.provideCompletionItems(
    { lineAt: () => ({ text: line }), getText: () => fullText || line },
    { line: 0, character: line.length }
  );
const labels = (items, kind) => items.filter((i) => !kind || i.kind === kind).map((i) => i.label);

let fail = 0;
let total = 0;
const check = (ok, msg) => { total++; if (!ok) { fail++; console.log(`FALLA: ${msg}`); } };

// Escribir una palabra suelta: funciones, no métodos
for (const line of ['Str', '\t\t\tStr', '&x = Str']) {
  const items = complete(line);
  check(labels(items, 'function').includes('StrSearch'), `${JSON.stringify(line)} debe ofrecer StrSearch`);
  check(!labels(items, 'method').length, `${JSON.stringify(line)} no debe ofrecer métodos`);
}
// Después de un punto: métodos, no funciones
for (const line of ['&x.', '&x.Str', '&Insert_CountryId.SetE']) {
  const items = complete(line);
  check(labels(items, 'method').includes('SetEmpty'), `${JSON.stringify(line)} debe ofrecer SetEmpty`);
  check(!labels(items, 'function').length, `${JSON.stringify(line)} no debe ofrecer funciones`);
}
// Después de &: variables (declaradas, usadas y del sistema), también con letras ya escritas
const src = 'parm(out:&pCountryId);\n&pC';
for (const line of ['&', '&pC']) {
  const items = provider.provideCompletionItems(
    { lineAt: () => ({ text: line }), getText: () => `${src.split('\n')[0]}\n${line}` },
    { line: 1, character: line.length }
  );
  const vars = labels(items, 'variable');
  check(vars.includes('pCountryId'), `${JSON.stringify(line)} debe ofrecer pCountryId`);
  check(vars.includes('Today'), `${JSON.stringify(line)} debe ofrecer Today`);
  check(!vars.includes('pC'), `${JSON.stringify(line)} no debe ofrecerse a sí mismo`);
  check(!labels(items, 'function').length, `${JSON.stringify(line)} no debe ofrecer funciones`);
}

if (fail) process.exit(1);
console.log(`OK: ${total} verificaciones de autocompletado`);
