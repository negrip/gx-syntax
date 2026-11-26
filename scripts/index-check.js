'use strict';
// Pruebas del índice (src/index.js) sobre una KB de ejemplo armada en una carpeta temporal.
//   node scripts/index-check.js                 -> pruebas
//   node scripts/index-check.js <carpeta-raíz>  -> escanea una KB real y muestra el árbol (solo lectura)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { scanKb, detectRoots } = require('../src/index');

const w = (file, text = '') => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};

function print(nodes, indent = '') {
  for (const n of nodes) {
    const tag = n.kind === 'object' ? `${n.type}${n.mainProgram ? '*' : ''}` : n.kind;
    console.log(`${indent}${n.name}  [${tag}]`);
    if (n.children) print(n.children, indent + '  ');
  }
}

async function real(root) {
  const t0 = Date.now();
  const kb = await scanKb(root);
  console.log(`${kb.objects.length} objetos, ${kb.mainPrograms.length} programas principales, ${Date.now() - t0} ms${kb.truncated ? ' (truncado)' : ''}`);
  print(kb.children);
}

async function tests() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gxkb-'));
  const src = path.join(tmp, 'ws', 'src');
  const obj = (type, name, props = '') => `${type} ${name}\n{\n\t#Properties\n\t\tName = "${name}"\n${props}\t#End\n}\n`;
  const main = '\t\tMainProgram = "True"\n';

  w(path.join(src, '#attributes', 'x.gx'), 'Attribute X\n{\n}\n');
  w(path.join(src, '#tables', 'Account.gx'), 'Table Account\n{\n}\n');
  w(path.join(src, 'General', 'module.toml'), 'ModuleIdentifier = "1"\nName = "General"\n');
  w(path.join(src, 'General', 'BackEnd', 'module.toml'), 'Name = "BackEnd"\n');
  w(path.join(src, 'General', 'BackEnd', 'Account.gx'), obj('Transaction', 'Account'));
  w(path.join(src, 'General', 'BackEnd', 'Account', 'Account_DataProvider.gx'), obj('DataProvider', 'Account_DataProvider', main));
  w(path.join(src, 'General', 'BackEnd', 'Account.web.xml'), '<x/>');
  w(path.join(src, 'General', 'BackEnd', 'Tools', 'Calc.gx'), obj('Procedure', 'Calc', main));
  w(path.join(src, 'General', 'Utils.gx'), obj('Procedure', 'Utils'));
  w(path.join(src, 'Zeta.gx'), obj('WebPanel', 'Zeta'));
  w(path.join(src, 'Zeta.local.gx'), obj('WebPanel', 'ZetaLocal'));
  w(path.join(src, '#preferences', 'Env.local.env.gx'), 'Environment Env\n{\n\tPassword = "secreto"\n}\n');
  w(path.join(src, 'General', '@Reports', 'Rep.gx'), obj('Procedure', 'Rep'));
  w(path.join(src, 'General', '@Reports', '@Nested', 'Deep.gx'), obj('Procedure', 'Deep'));
  w(path.join(src, 'General', '#domains', 'Amount.gx'), obj('Domain', 'Amount'));
  w(path.join(src, 'General', '#images', 'Logo.gx'), obj('Image', 'Logo'));
  w(path.join(src, 'General', '#attributes', 'Hidden.gx'), 'Attribute Hidden\n{\n}\n');
  w(path.join(src, 'alfa.gx'), obj('SDT', 'alfa'));
  w(path.join(tmp, 'ws', 'ref', 'GeneXus', 'module.toml'), 'Name = "GeneXus"\n');
  w(path.join(tmp, 'ws', 'ref', 'GeneXus', 'Client', 'Storage.gx'), obj('ExternalObject', 'Storage'));
  w(path.join(tmp, 'ws', 'node_modules', 'pkg', 'bad.gx'), obj('Procedure', 'Bad'));
  w(path.join(tmp, 'loose', 'sub', 'Only.gx'), obj('Procedure', 'Only'));
  w(path.join(tmp, 'empty', 'readme.txt'), 'nada');

  let fail = 0;
  let total = 0;
  const check = (ok, msg) => { total++; if (!ok) { fail++; console.log(`FALLA: ${msg}`); } };
  const find = (nodes, name) => nodes.find((n) => n.name === name);

  const kb = await scanKb(src);
  const kbAllNames = () => kb.objects.map((o) => o.name);
  const names = kb.children.map((n) => n.name);
  check(JSON.stringify(names) === JSON.stringify(['General', 'alfa', 'Zeta']), `orden raíz: ${names}`); // contenedores primero, luego objetos sin distinguir mayúsculas
  check(!names.some((n) => n.startsWith('#')), 'las carpetas # no se muestran');
  const general = find(kb.children, 'General');
  check(general.kind === 'module', 'General es módulo (module.toml)');
  const back = find(general.children, 'BackEnd');
  check(back && back.kind === 'module', 'BackEnd es módulo');
  check(find(general.children, 'Utils').type === 'Procedure', 'tipo desde la primera línea');
  check(general.children.map((n) => n.name).join() === 'BackEnd,Reports,Amount,Logo,Utils', `orden: módulos, carpetas, objetos: ${general.children.map((n) => n.name)}`);
  const reports = find(general.children, 'Reports');
  check(reports.kind === 'folder' && !!find(reports.children, 'Rep') && find(reports.children, 'Nested'), 'carpeta @Reports sin la arroba, con su carpeta @Nested');
  check(find(general.children, 'Amount').type === 'Domain' && find(general.children, 'Logo').type === 'Image', 'objetos de #domains y #images dentro del módulo');
  check(!kbAllNames().includes('Hidden'), '#attributes no se muestra');
  check(!kbAllNames().includes('ZetaLocal') && !kbAllNames().includes('Env'), 'los archivos .local no se leen');
  const account = find(back.children, 'Account');
  check(account.type === 'Transaction', 'Account es Transaction');
  check(!find(back.children, 'Account_DataProvider'), 'el DataProvider no queda suelto');
  check(!!find(account.children, 'Account_DataProvider'), 'el DataProvider cuelga de la Transacción (carpeta del mismo nombre)');
  const assoc = find(account.children, 'Associated Tables');
  check(assoc && assoc.kind === 'group' && assoc.children[0].name === 'Account' && assoc.children[0].type === 'Table', 'Associated Tables con la tabla de #tables');
  check(back.children[0].name === 'Tools' && back.children[0].kind === 'folder', 'Tools es carpeta común y va antes que los objetos');
  check(kb.mainPrograms.map((o) => o.name).join() === 'Account_DataProvider,Calc', `programas principales: ${kb.mainPrograms.map((o) => o.name)}`);
  check(!kb.objects.some((o) => o.name === 'Bad'), 'node_modules ignorado');
  check(!kb.objects.some((o) => o.type === 'Table'), 'las tablas de #tables no son objetos sueltos');

  const trunc = await scanKb(src, { maxFiles: 3 });
  check(trunc.truncated && trunc.objects.length <= 3, 'límite de archivos');

  const rootsWs = await detectRoots(path.join(tmp, 'ws'));
  check(rootsWs.map((r) => path.basename(r)).sort().join() === 'ref,src', `raíces en la carpeta de arriba: ${rootsWs.map((r) => path.basename(r))}`);
  const rootsSrc = await detectRoots(src);
  check(rootsSrc.length === 1 && rootsSrc[0] === src, 'abrir src directamente');
  const rootsLoose = await detectRoots(path.join(tmp, 'loose'));
  check(rootsLoose.length === 1, 'carpeta sin marcas pero con .gx: ella misma es la raíz');
  check((await detectRoots(path.join(tmp, 'empty'))).length === 0, 'carpeta sin .gx: sin raíz');

  // Modelo del árbol
  const { buildModels } = require('../src/treemodel');
  const models = buildModels([kb]);
  check(models.top.length === 1 && models.top[0].kind === 'root' && models.top[0].label === 'src', 'raíz del modelo');
  const first = models.top[0].children[0];
  check(first.kind === 'main' && first.children.map((c) => c.label).join() === 'Account_DataProvider,Calc', 'nodo Main Programs al inicio');
  const accModel = models.byFile.get(account.file.toLowerCase());
  check(accModel && accModel.parent.label === 'BackEnd' && accModel.parent.parent.label === 'General' && accModel.parent.parent.parent.kind === 'root', 'cadena de padres para revelar el archivo activo');
  const ids = new Set();
  const dupIds = [];
  const visit = (m) => { if (ids.has(m.id)) dupIds.push(m.id); ids.add(m.id); m.children.forEach(visit); };
  models.top.forEach(visit);
  check(!dupIds.length, `ids únicos (repetidos: ${dupIds.length})`);
  check(models.search[0].name === 'Account' && models.search.length === kb.objects.length, 'lista de búsqueda ordenada');

  // Estilos del árbol: cada color usado debe estar definido como color de tema en package.json
  const { TYPE_STYLE, DEFAULT_TYPE_STYLE, KIND_STYLE, COLORS } = require('../src/style');
  const declared = new Set(require('../package.json').contributes.colors.map((c) => c.id));
  const used = [...Object.values(TYPE_STYLE), DEFAULT_TYPE_STYLE, ...Object.values(KIND_STYLE)].map((s) => s.color).filter(Boolean);
  for (const id of used) check(declared.has(`gxSyntax.${id}`), `color de tema sin declarar en package.json: ${id}`);
  for (const id of Object.keys(COLORS)) check(declared.has(`gxSyntax.${id}`), `color sin declarar: ${id}`);
  check(['Transaction', 'Procedure', 'WebPanel', 'DataProvider', 'SDT', 'Table'].every((t) => TYPE_STYLE[t]), 'tipos principales con estilo');

  // Menú "Nuevo objeto": solo en el árbol GeneXus, dentro de src (ref es de solo lectura)
  const menus = require('../package.json').contributes.menus;
  check(!menus['explorer/context'], 'sin menú Nuevo objeto en el Explorador común');
  const item = menus['view/item/context'].find((m) => m.command === 'gxSyntax.tree.newObject');
  check(item && /viewItem == gxContainerSrc/.test(item.when), 'menú Nuevo objeto solo en contenedores de src del árbol');
  const treeSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'tree.js'), 'utf8');
  const reSrc = new RegExp(/\? 'gxContainerSrc'/.exec(treeSrc) && /const containerContext = \(p\) => \((\/.*\/i)\.test/.exec(treeSrc)[1].slice(1, -2), 'i');
  check(reSrc.test('c:\\kb\\src') && reSrc.test('c:\\kb\\src\\General\\BackEnd'), 'contenedores de src permiten crear');
  check(!reSrc.test('c:\\kb\\ref\\GeneXus') && !reSrc.test('c:\\proyectos\\mi-src'), 'ref y otras carpetas no permiten crear');

  fs.rmSync(tmp, { recursive: true, force: true });
  if (fail) process.exit(1);
  console.log(`OK: ${total} verificaciones del índice`);
}

(process.argv[2] ? real(process.argv[2]) : tests()).catch((e) => { console.error(e); process.exit(1); });
