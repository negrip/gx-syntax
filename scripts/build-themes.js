// Genera themes/gx-dark-color-theme.json y themes/gx-light-color-theme.json
// desde una sola paleta. Editar PALETTE y correr: npm run themes
const fs = require('fs');
const path = require('path');

// Colores base
const BASE = {
  blue: '#1F2F98', teal: '#06CBC1', sky: '#7BD5F5', navy: '#081E57',
  lavenderLt: '#EDEEF9', lavenderMd: '#D0D7FF', violet: '#281D57', electric: '#2D6BFF',
};

// Roles semanticos por tema. "ajuste" = variante oscurecida/aclarada del color base para dar contraste.
const PALETTE = {
  dark: {
    type: 'dark',
    bg: '#171717', fg: '#FAFAFA', muted: '#A3A3A3', line: '#262626', select: '#06CBC133',
    section: BASE.lavenderMd,   // #Rules, #End
    objType: BASE.teal,         // Transaction, Procedure
    objName: '#FAFAFA',          // nombre del objeto
    keyword: BASE.teal,         // if, for each, event
    func: '#FAFAFA',             // funciones y metodos
    rule: BASE.lavenderMd,      // parm, noaccept, builtins
    variable: BASE.sky,         // &variables
    attribute: '#5B8DFF',        // ajuste: electric aclarado para contraste sobre oscuro
    enumValue: '#C792EA',        // valor tras "Tipo:" (StyleClass:Nombre); fuera de paleta
    property: BASE.lavenderMd,  // DataType =, Name =
    klass: BASE.lavenderMd,     // TrnMode, StyleClass
    string: '#F2B83A',           // ambar
    number: '#3CC884',           // verde
    comment: '#A3A3A3',
  },
  light: {
    type: 'light',
    bg: '#FFFFFF', fg: '#282828', muted: '#737373', line: '#EBEBEB', select: '#06CBC133',
    section: BASE.navy,
    objType: '#05857E',          // ajuste: teal oscurecido para contraste sobre blanco
    objName: BASE.navy,
    keyword: BASE.blue,
    func: '#282828',
    rule: BASE.violet,
    variable: '#0B7FA8',         // ajuste: sky oscurecido
    attribute: BASE.electric,
    enumValue: '#8A3FB8',        // valor tras "Tipo:"; fuera de paleta
    property: BASE.violet,
    klass: BASE.violet,
    string: '#9A6700',           // ambar oscurecido
    number: '#1E8E4E',           // verde oscurecido
    comment: '#737373',
  },
};

function build(name, p) {
  const t = (scope, foreground, fontStyle) => ({ scope, settings: { foreground, ...(fontStyle ? { fontStyle } : {}) } });
  return {
    name,
    type: p.type,
    colors: {
      'editor.background': p.bg,
      'editor.foreground': p.fg,
      'editor.lineHighlightBackground': p.line,
      'editor.selectionBackground': p.select,
      'editorCursor.foreground': BASE.teal,
      'editorLineNumber.foreground': p.muted,
      'editorLineNumber.activeForeground': p.fg,
      // Barra de estado inferior
      'statusBar.background': BASE.navy,
      'statusBar.foreground': '#FFFFFF',
      'statusBar.noFolderBackground': BASE.navy,
      'statusBar.debuggingBackground': BASE.violet,
      'statusBar.border': '#00000000',
      'statusBarItem.hoverBackground': '#FFFFFF1F',
      'statusBarItem.remoteBackground': BASE.blue,
      'statusBarItem.remoteForeground': '#FFFFFF',
    },
    tokenColors: [
      t(['comment', 'comment.line.double-slash.gx', 'comment.block.gx'], p.comment, 'italic'),
      t(['keyword.control.section.gx', 'punctuation.definition.section.gx'], p.section, 'bold'),
      t(['storage.type.class.gx'], p.objType, 'bold'),
      t(['entity.name.type.class.gx'], p.objName, 'bold'),
      t(['keyword.control.gx', 'keyword.control.declaration.gx', 'keyword.operator.word.gx'], p.keyword),
      t(['entity.name.function.event.gx', 'entity.name.function.subroutine.gx'], p.objName, 'bold'),
      t(['entity.name.function.call.gx', 'entity.name.function.method.gx'], p.func),
      t(['support.function.rule.gx', 'support.function.builtin.gx'], p.rule, 'bold'),
      t(['variable.other.gx', 'variable.other.declaration.gx'], p.variable),
      t(['variable.other.constant.attribute.gx'], p.attribute),
      t(['support.constant.enum.gx'], p.enumValue),
      t(['variable.other.property.gx'], p.property),
      t(['support.class.gx', 'storage.modifier.parameter-direction.gx'], p.klass),
      t(['entity.other.attribute-name.platform.gx', 'punctuation.definition.tag.gx'], p.muted),
      t(['string.quoted.single.gx', 'string.quoted.double.gx', 'string.quoted.double.nontranslatable.gx'], p.string),
      t(['constant.numeric.gx', 'constant.language.gx'], p.number),
      t(['keyword.operator.gx', 'keyword.operator.assignment.gx', 'keyword.operator.key-marker.gx', 'punctuation.separator.gx', 'punctuation.separator.comma.gx', 'punctuation.definition.list.begin.gx', 'punctuation.definition.list.end.gx'], p.muted),
    ],
  };
}

const outDir = path.join(__dirname, '..', 'themes');
fs.mkdirSync(outDir, { recursive: true });
for (const [key, label] of [['dark', 'GX Dark'], ['light', 'GX Light']]) {
  const file = path.join(outDir, `gx-${key}-color-theme.json`);
  fs.writeFileSync(file, JSON.stringify(build(label, PALETTE[key]), null, 2) + '\n');
  console.log('escrito', path.relative(process.cwd(), file));
}
