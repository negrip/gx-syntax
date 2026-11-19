'use strict';
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { TEMPLATES } = require('./templates');

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

function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand('gxSyntax.newObject', newObject));
}

function deactivate() {}

module.exports = { activate, deactivate };
