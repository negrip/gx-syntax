'use strict';
// Firmas con tipos de las funciones más usadas. Fuente: wiki oficial de GeneXus
// (docs.genexus.com), una página por función. Los nombres de los parámetros son los de la
// wiki, salvo StrSearch y StrSearchRev, que usan los que muestra la IDE de GeneXus.
//
// Regla de esta tabla: solo se escribe lo que la wiki dice. Si la wiki no indica un tipo
// o el tipo de retorno, se omite (type/returns ausentes) en vez de suponerlo.
//   params: [{ name, type?, optional?, rest? }]   rest = admite más argumentos del mismo tipo
//   url:    página de la wiki que respalda la firma

const W = (id, title) => `https://docs.genexus.com/en/wiki?${id}%2C${title}+function=`;
const p = (name, type, extra = {}) => ({ name, type, ...extra });

const SIGNATURES = [
  // --- Texto ---
  { name: 'Len', params: [p('Str', 'Character')], returns: 'Numeric', url: W(8436, 'Len') },
  { name: 'Trim', params: [p('Str', 'Character')], returns: 'Character', url: W(8424, 'Trim') },
  { name: 'LTrim', params: [p('Str', 'Character')], returns: 'Character', url: W(8423, 'LTrim') },
  { name: 'RTrim', params: [p('Str', 'Character')], returns: 'Character', url: W(8425, 'RTrim') },
  { name: 'Upper', params: [p('Str', 'Character')], returns: 'Character', url: W(8466, 'Upper') },
  { name: 'Lower', params: [p('Str', 'Character')], returns: 'Character', url: W(8464, 'Lower') },
  {
    name: 'SubStr',
    params: [p('Str', 'Character'), p('Start', 'Numeric'), p('Length', 'Numeric')],
    returns: 'Character',
    url: W(8527, 'Substr'),
  },
  {
    name: 'Str',
    params: [p('Value', 'Numeric'), p('Length', 'Numeric', { optional: true }), p('Decimals', 'Numeric', { optional: true })],
    returns: 'Character',
    url: W(7474, 'Str'),
  },
  {
    name: 'StrReplace',
    params: [p('Str', 'Character'), p('Old', 'Character'), p('New', 'Character')],
    returns: 'Character',
    url: W(8505, 'StrReplace'),
  },
  {
    name: 'StrSearch',
    params: [p('String', 'Character'), p('SubString', 'Character'), p('Start', 'Numeric', { optional: true })],
    returns: 'Numeric',
    url: W(8529, 'StrSearch'),
  },
  {
    name: 'StrSearchRev',
    params: [p('String', 'Character'), p('SubString', 'Character'), p('Start', 'Numeric', { optional: true })],
    returns: 'Numeric',
    url: W(8507, 'StrSearchRev'),
  },
  {
    name: 'PadL',
    params: [p('Str', 'Character'), p('Len', 'Numeric'), p('FillChar', 'Character', { optional: true })],
    returns: 'Character',
    url: W(8475, 'PadL'),
  },
  {
    name: 'PadR',
    params: [p('Str', 'Character'), p('Len', 'Numeric'), p('FillChar', 'Character', { optional: true })],
    returns: 'Character',
    url: W(8476, 'PadR'),
  },
  {
    name: 'Format',
    params: [p('Str', 'Character'), p('Value', 'Character', { optional: true, rest: true })],
    returns: 'Character',
    url: W(8406, 'Format'),
  },
  { name: 'Val', params: [p('Str', 'Character')], returns: 'Numeric', url: W(8528, 'Val') },
  {
    name: 'Concat',
    params: [p('Str1', 'Character'), p('Str2', 'Character'), p('Separator', 'Character', { optional: true })],
    returns: 'Character',
    url: W(8352, 'Concat'),
  },
  // La wiki solo tipa la condición; no declara tipos de TruePart/FalsePart ni de retorno.
  {
    name: 'Iif',
    params: [p('Expression', 'Boolean'), p('TruePart'), p('FalsePart')],
    url: 'https://docs.genexus.com/en/wiki?14280%2Ciif+function=',
  },

  // --- Fecha y hora ---
  { name: 'Today', params: [], returns: 'Date', url: W(8334, 'Today') },
  { name: 'Now', params: [], returns: 'DateTime', url: W(8335, 'Now') },
  { name: 'Year', params: [p('Date', 'Date | DateTime')], returns: 'Numeric', url: W(8380, 'Year') },
  { name: 'Month', params: [p('Date', 'Date | DateTime')], returns: 'Numeric', url: 'https://docs.genexus.com/en/wiki?8379,Month+function' },
  { name: 'Day', params: [p('Date', 'Date | DateTime')], returns: 'Numeric', url: W(8376, 'Day') },
  {
    name: 'Age',
    params: [p('Date1', 'Date | DateTime'), p('Date2', 'Date | DateTime', { optional: true })],
    returns: 'Numeric',
    url: W(8330, 'Age'),
  },
  {
    name: 'AddMth',
    params: [p('Date', 'Date | DateTime'), p('Months', 'Numeric')],
    returns: 'Date | DateTime',
    url: W(8314, 'AddMth'),
  },
  {
    name: 'AddYr',
    params: [p('Date', 'Date | DateTime'), p('Years', 'Numeric')],
    returns: 'Date | DateTime',
    url: W(8317, 'AddYr'),
  },
  {
    name: 'YMDtoD',
    params: [p('Year', 'Numeric'), p('Month', 'Numeric'), p('Day', 'Numeric')],
    returns: 'Date',
    url: W(7627, 'YMDtoD'),
  },
  { name: 'CtoD', params: [p('String', 'Character')], returns: 'Date', url: W(7472, 'CtoD') },
  { name: 'DtoC', params: [p('Date', 'Date')], returns: 'Character', url: W(7475, 'DtoC') },

  // --- Numéricas y otras ---
  { name: 'Mod', params: [p('Dividend', 'Numeric'), p('Divisor', 'Numeric')], returns: 'Numeric', url: W(13641, 'Mod') },
  { name: 'Abs', params: [p('Value', 'Numeric')], returns: 'Numeric', url: W(57730, 'Abs') },
  { name: 'Round', params: [p('Value', 'Numeric'), p('Decimals', 'Numeric')], returns: 'Numeric', url: W(8486, 'Round') },
  { name: 'Int', params: [p('Value', 'Numeric')], returns: 'Numeric', url: W(8418, 'Int') },
  { name: 'Trunc', params: [p('Value', 'Numeric'), p('Decimals', 'Numeric')], returns: 'Numeric', url: W(8488, 'Trunc') },
  { name: 'IsNull', params: [p('Attribute')], returns: 'Boolean', url: W(2357, 'IsNull') },
  // La wiki no declara tipo de retorno para Nullvalue.
  { name: 'NullValue', params: [p('Attribute | &Variable')], url: W(8226, 'Nullvalue') },
  {
    name: 'Link',
    params: [p('Object | URL'), p('Par', undefined, { optional: true, rest: true })],
    returns: 'Character',
    url: W(8444, 'Link'),
  },
];

module.exports = { SIGNATURES };
