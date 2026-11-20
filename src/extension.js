'use strict';
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { TEMPLATES } = require('./templates');
const { parseSections } = require('./sections');

const NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

// Carpeta destino: la elegida en el explorador (si es archivo, su carpeta),
// si no la del archivo activo, si no la primera carpeta del workspace.
function targetFolder(uri) {
  if (uri && uri.fsPath) {
    return fs.existsSync(uri.fsPath) && fs.statSync(uri.fsPath).isDirectory()
      ? uri.fsPath
      : path.dirname(uri.fsPath);
  }
  const active = vscode.window.activeTextEditor;
  if (active && active.document.uri.scheme === 'file') return path.dirname(active.document.uri.fsPath);
  const ws = vscode.workspace.workspaceFolders;
  return ws && ws.length ? ws[0].uri.fsPath : undefined;
}

async function newObject(uri) {
  const folder = targetFolder(uri);
  if (!folder) {
    vscode.window.showWarningMessage('GX: abrí una carpeta de trabajo para crear el objeto.');
    return;
  }
  const pick = await vscode.window.showQuickPick(
    TEMPLATES.map((t) => ({ label: t.label, description: t.type, detail: t.detail, tpl: t })),
    { title: 'Nuevo objeto GeneXus', placeHolder: 'Tipo de objeto' }
  );
  if (!pick) return;

  const name = await vscode.window.showInputBox({
    title: `Nuevo ${pick.tpl.type}`,
    prompt: `Nombre del objeto (se crea en ${folder})`,
    validateInput: (v) => {
      if (!NAME_RE.test(v || '')) return 'Solo letras, números y _ ; no puede empezar con número.';
      if (fs.existsSync(path.join(folder, `${v}.gx`))) return `Ya existe ${v}.gx en esa carpeta.`;
      return undefined;
    },
  });
  if (!name) return;

  const file = path.join(folder, `${name}.gx`);
  if (fs.existsSync(file)) return; // revalida por si apareció mientras se tipeaba
  fs.writeFileSync(file, pick.tpl.build(name), 'utf8');
  const doc = await vscode.workspace.openTextDocument(file);
  await vscode.window.showTextDocument(doc);
}

// ---- Secciones: Outline / Ctrl+Shift+O, "Ir a sección" y "Volver" ----

const range = (doc, a, b) => new vscode.Range(a, 0, b, doc.lineAt(Math.min(b, doc.lineCount - 1)).text.length);

const symbolProvider = {
  provideDocumentSymbols(doc) {
    return parseSections(doc.getText()).map((sec) => {
      const top = new vscode.DocumentSymbol(
        `#${sec.name}`, '', vscode.SymbolKind.Namespace,
        range(doc, sec.startLine, sec.endLine), range(doc, sec.startLine, sec.startLine)
      );
      top.children = sec.children.map((c) =>
        new vscode.DocumentSymbol(
          c.name, c.kind, c.kind === 'Event' ? vscode.SymbolKind.Event : vscode.SymbolKind.Function,
          range(doc, c.startLine, c.endLine), range(doc, c.startLine, c.startLine)
        )
      );
      return top;
    });
  },
};

// Pila propia de posiciones: VS Code no registra en su historial los saltos cortos.
const backStack = [];
const MAX_BACK = 50;

async function goToSection() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'genexus-gx') {
    vscode.window.showInformationMessage('GX: abrí un archivo .gx para ir a una sección.');
    return;
  }
  const items = [];
  for (const sec of parseSections(editor.document.getText())) {
    items.push({ label: `#${sec.name}`, description: `línea ${sec.startLine + 1}`, line: sec.startLine });
    for (const c of sec.children) {
      items.push({ label: `    ${c.kind} ${c.name}`, description: `línea ${c.startLine + 1}`, line: c.startLine });
    }
  }
  if (!items.length) {
    vscode.window.showInformationMessage('GX: este archivo no tiene secciones (#Rules, #Events, ...).');
    return;
  }
  const pick = await vscode.window.showQuickPick(items, { title: 'Ir a sección', placeHolder: 'Sección, Event o Sub' });
  if (!pick) return;
  backStack.push({ uri: editor.document.uri, position: editor.selection.active });
  if (backStack.length > MAX_BACK) backStack.shift();
  const pos = new vscode.Position(pick.line, 0);
  editor.selection = new vscode.Selection(pos, pos);
  editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.AtTop);
}

async function goBack() {
  const prev = backStack.pop();
  if (!prev) {
    await vscode.commands.executeCommand('workbench.action.navigateBack');
    return;
  }
  const doc = await vscode.workspace.openTextDocument(prev.uri);
  const editor = await vscode.window.showTextDocument(doc);
  editor.selection = new vscode.Selection(prev.position, prev.position);
  editor.revealRange(new vscode.Range(prev.position, prev.position), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('gxSyntax.newObject', newObject),
    vscode.commands.registerCommand('gxSyntax.goToSection', goToSection),
    vscode.commands.registerCommand('gxSyntax.goBack', goBack),
    vscode.languages.registerDocumentSymbolProvider({ language: 'genexus-gx' }, symbolProvider)
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
