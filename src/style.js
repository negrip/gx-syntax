'use strict';
// Icono (codicon de VS Code) y color de cada tipo de objeto del árbol.
// Los colores son colores de tema (gxSyntax.<id>, definidos en package.json), así que
// se adaptan a temas claros y oscuros y se pueden cambiar con workbench.colorCustomizations.
// Paleta basada en los colores de la IDE de GeneXus (verde, violeta, turquesa, naranja, rosa).
// Los iconos son provisionales (los de VS Code); luego se reemplazan por iconos propios.

const TYPE_STYLE = {
  Transaction: { icon: 'table', color: 'transaction' },
  Procedure: { icon: 'symbol-namespace', color: 'procedure' },
  DataProvider: { icon: 'list-tree', color: 'dataProvider' },
  WebPanel: { icon: 'browser', color: 'webPanel' },
  WebComponent: { icon: 'extensions', color: 'webComponent' },
  DataSelector: { icon: 'filter', color: 'dataSelector' },
  SDT: { icon: 'symbol-structure', color: 'sdt' },
  Table: { icon: 'table', color: 'table' },
  Domain: { icon: 'symbol-key', color: 'domain' },
  API: { icon: 'globe', color: 'api' },
  MasterPage: { icon: 'layout', color: 'masterPage' },
  ExternalObject: { icon: 'plug', color: 'externalObject' },
  WorkWith: { icon: 'edit', color: 'workWith' },
  Diagram: { icon: 'type-hierarchy', color: 'diagram' },
  SubTypeGroup: { icon: 'symbol-enum', color: 'domain' },
  SubtypeGroup: { icon: 'symbol-enum', color: 'domain' },
  Image: { icon: 'file-media', color: 'diagram' },
  File: { icon: 'file', color: 'diagram' },
  DataView: { icon: 'graph', color: 'diagram' },
  Theme: { icon: 'paintcan', color: 'masterPage' },
  DesignSystem: { icon: 'symbol-color', color: 'masterPage' },
};
const DEFAULT_TYPE_STYLE = { icon: 'file-code', color: 'diagram' };

const KIND_STYLE = {
  root: { icon: 'root-folder' },
  module: { icon: 'symbol-method', color: 'module' },
  group: { icon: 'folder' },
  main: { icon: 'play', color: 'mainProgram' },
};

// Colores por defecto: [oscuro, claro]
const COLORS = {
  transaction: ['#4cc764', '#1f9d3a'],
  procedure: ['#a29bff', '#605ca8'],
  dataProvider: ['#2dd4c4', '#00746b'],
  webPanel: ['#5aaaff', '#1a6fd1'],
  webComponent: ['#7fd0ff', '#0b7bb5'],
  dataSelector: ['#ffae42', '#c26a00'],
  sdt: ['#ff8a4c', '#d9480f'],
  table: ['#8e8ad8', '#4b4797'],
  domain: ['#26b5a8', '#00746b'],
  api: ['#00c4b4', '#007f75'],
  masterPage: ['#ffc44d', '#b07400'],
  externalObject: ['#ff5c8a', '#c4124a'],
  workWith: ['#00bfae', '#00796b'],
  diagram: ['#9aa0a6', '#5f6368'],
  module: ['#00bfae', '#00796b'],
  mainProgram: ['#4cc764', '#1f9d3a'],
};

module.exports = { TYPE_STYLE, DEFAULT_TYPE_STYLE, KIND_STYLE, COLORS };
