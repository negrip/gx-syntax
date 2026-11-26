'use strict';
// Vista "GeneXus" del Explorador: árbol de objetos de la KB (módulos, carpetas, objetos),
// buscador por nombre y sincronización con el archivo activo. Solo lee archivos .gx.
const vscode = require('vscode');
const { scanKb, detectRoots } = require('./index');
const { buildModels } = require('./treemodel');

const { TYPE_STYLE, DEFAULT_TYPE_STYLE, KIND_STYLE } = require('./style');

const icon = ({ icon: id, color }) =>
  new vscode.ThemeIcon(id, color ? new vscode.ThemeColor(`gxSyntax.${color}`) : undefined);

// Solo se crean objetos dentro de src (ref es de solo lectura).
const containerContext = (p) => (/(^|[\\/])src([\\/]|$)/i.test(p) ? 'gxContainerSrc' : 'gxContainer');

const cfg = () => vscode.workspace.getConfiguration('gxSyntax');

class GxTreeProvider {
  constructor() {
    this._emitter = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._emitter.event;
    this.models = { top: [], byFile: new Map(), search: [] };
    this._timer = undefined;
    this._warned = new Set();
    this._running = false;
    this._again = false;
  }

  get search() { return this.models.search; }

  // Reconstruye el índice. Si ya hay una corrida en curso, encadena otra al terminar.
  async refresh() {
    if (this._running) { this._again = true; return; }
    this._running = true;
    try {
      do {
        this._again = false;
        await this._scan();
      } while (this._again);
    } finally {
      this._running = false;
    }
  }

  // Refresco con retardo, para agrupar ráfagas de cambios de archivos.
  schedule(ms = 600) {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.refresh(), ms);
  }

  async _scan() {
    const enabled = cfg().get('tree.enabled', true);
    const maxFiles = Math.max(100, cfg().get('index.maxFiles', 20000));
    const kbs = [];
    if (enabled) {
      for (const folder of vscode.workspace.workspaceFolders || []) {
        if (folder.uri.scheme !== 'file') continue;
        for (const root of await detectRoots(folder.uri.fsPath)) {
          const kb = await scanKb(root, { maxFiles });
          if (kb.truncated && !this._warned.has(root)) {
            this._warned.add(root);
            vscode.window.showWarningMessage(
              `GX: la carpeta "${kb.name}" supera ${maxFiles} archivos .gx; el árbol muestra solo una parte. Se puede subir "gxSyntax.index.maxFiles".`
            );
          }
          if (kb.objects.length) kbs.push(kb);
        }
      }
    }
    this.models = buildModels(kbs);
    await vscode.commands.executeCommand('setContext', 'gxSyntax.hasKb', kbs.length > 0);
    this._emitter.fire(undefined);
  }

  // ---- TreeDataProvider ----
  getChildren(model) {
    return model ? model.children : this.models.top;
  }

  getParent(model) {
    return model.parent || undefined;
  }

  getTreeItem(model) {
    const raw = model.raw;
    const item = new vscode.TreeItem(
      model.label,
      model.children.length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    );
    item.id = model.id;
    if (model.kind === 'object') {
      item.iconPath = icon(TYPE_STYLE[raw.type] || DEFAULT_TYPE_STYLE);
      item.resourceUri = vscode.Uri.file(raw.file);
      item.tooltip = `${raw.type} ${raw.name}\n${raw.file}`;
      item.command = { command: 'vscode.open', title: 'Abrir', arguments: [vscode.Uri.file(raw.file)] };
      item.contextValue = 'gxObject';
    } else if (model.kind === 'folder') {
      item.iconPath = vscode.ThemeIcon.Folder;
      item.resourceUri = vscode.Uri.file(raw.path);
      item.contextValue = containerContext(raw.path);
    } else {
      item.iconPath = icon(KIND_STYLE[model.kind] || { icon: 'folder' });
      if (model.kind === 'root') item.tooltip = raw.path;
      if (model.kind === 'module') item.tooltip = `Módulo\n${raw.path}`;
      if (model.kind === 'root' || model.kind === 'module') item.contextValue = containerContext(raw.path);
    }
    return item;
  }
}

// Lista de todos los objetos para abrir por nombre ("Open:" de la IDE).
async function searchObjects(provider) {
  const items = provider.search.map((o) => ({ label: o.name, description: o.type, detail: o.relative, file: o.file }));
  if (!items.length) {
    vscode.window.showInformationMessage('GX: no hay objetos indexados todavía.');
    return;
  }
  const pick = await vscode.window.showQuickPick(items, {
    title: 'Buscar objeto GeneXus',
    placeHolder: 'Nombre del objeto',
    matchOnDescription: true,
    matchOnDetail: true,
  });
  if (pick) await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(pick.file));
}

// Abre el Explorador y expande la vista "GeneXus".
const showTree = () => vscode.commands.executeCommand('gxSyntax.tree.focus');

function registerTree(context) {
  const provider = new GxTreeProvider();
  const view = vscode.window.createTreeView('gxSyntax.tree', { treeDataProvider: provider, showCollapseAll: true });

  const reveal = (editor) => {
    if (!editor || !view.visible || !cfg().get('tree.autoReveal', true)) return;
    const model = provider.models.byFile.get(editor.document.uri.fsPath.toLowerCase());
    if (model) view.reveal(model, { select: true, focus: false, expand: true }).then(undefined, () => {});
  };

  const watchGx = vscode.workspace.createFileSystemWatcher('**/*.gx');
  const watchToml = vscode.workspace.createFileSystemWatcher('**/module.toml');
  const onChange = () => provider.schedule();
  for (const w of [watchGx, watchToml]) {
    w.onDidCreate(onChange);
    w.onDidDelete(onChange);
  }
  // Un cambio de contenido puede cambiar el tipo o MainProgram: también se refresca.
  watchGx.onDidChange(() => provider.schedule(1500));

  context.subscriptions.push(
    view,
    watchGx,
    watchToml,
    vscode.commands.registerCommand('gxSyntax.tree.refresh', () => provider.refresh()),
    vscode.commands.registerCommand('gxSyntax.showTree', showTree),
    vscode.commands.registerCommand('gxSyntax.tree.newObject', (model) =>
      model && model.raw && model.raw.path
        ? vscode.commands.executeCommand('gxSyntax.newObject', vscode.Uri.file(model.raw.path))
        : undefined),
    vscode.commands.registerCommand('gxSyntax.searchObjects', () => searchObjects(provider)),
    vscode.window.onDidChangeActiveTextEditor(reveal),
    view.onDidChangeVisibility((e) => e.visible && reveal(vscode.window.activeTextEditor)),
    vscode.workspace.onDidChangeWorkspaceFolders(() => provider.schedule(100)),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('gxSyntax')) provider.schedule(100);
    }),
    { dispose: () => clearTimeout(provider._timer) }
  );

  // La primera vez que se encuentra una KB, se avisa dónde está el árbol (una sola vez).
  const announce = provider.onDidChangeTreeData(async () => {
    if (!provider.models.top.length) return;
    announce.dispose();
    if (context.globalState.get('gxSyntax.treeAnnounced')) return;
    await context.globalState.update('gxSyntax.treeAnnounced', true);
    const pick = await vscode.window.showInformationMessage(
      'GX: encontré una KB. Los objetos están en la vista "GeneXus" del Explorador (panel de la izquierda, debajo de Timeline).',
      'Mostrar'
    );
    if (pick === 'Mostrar') showTree();
  });
  context.subscriptions.push(announce);

  provider.refresh();
  return provider;
}

module.exports = { registerTree };
