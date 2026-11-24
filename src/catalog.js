'use strict';
// Catálogo para el autocompletado. Firmas tomadas de la documentación de funciones y
// métodos de GeneXus. Cada entrada es una firma: "Nombre(parámetros)".
// Las propiedades (sin paréntesis) van en PROPERTIES.

const FUNCTIONS = `
Mod(<dividend>, <divisor>)
Abs(<value>)
Round(<expression>, <decimals>)
RoundToEven(<expression>, <decimals>)
Int(<expression>)
Trunc(<expression>)
Random()
RSeed(<seed>)
Today()
Now()
Year(<expression>)
Month(<expression>)
Day(<expression>)
Hour(<expression>)
Minute(<expression>)
Second(<expression>)
Age(<expression>[, <reference-expression>])
YMDtoD(<year>, <month>, <day>)
YMDHMStoT(<year>, <month>, <day>[, <hour>, <minute>, <second>])
DoW(<expression>)
EoM(<expression>)
CMonth(<expression>[, <language>])
AddMth(<expression>, <quantity>)
AddYr(<expression>, <quantity>)
TAdd(<expression>, <seconds>)
TDiff(<expression-1>, <expression-2>)
CtoD(<expression>)
CtoT(<expression>)
DtoC(<expression>)
TtoC(<expression>, <date-digits>, <time-digits>)
HTMLClean(<expression>)
Len(<expression>)
Trim(<expression>)
LTrim(<expression>)
RTrim(<expression>)
Upper(<expression>)
Lower(<expression>)
SubStr(<expression>, <start>, <length>)
Str(<expression>[, <length>[, <decimals>]])
StrReplace(<expression>, <old>, <new>)
StrSearch(<expression>, <substr>[, <start>])
StrSearchRev(<expression>, <substr>[, <start>])
PadL(<expression>, <length>[, <fill-char>])
PadR(<expression>, <length>[, <fill-char>])
ToBase64(<expression>)
FromBase64(<expression>)
ToFormattedString(<expression>)
Val(<expression>)
Concat(<expression-1>, <expression-2>[, <separator>])
Format(<template>, <value-1>, …, <value-9>)
Space(<count>)
Chr(<ascii-code>)
Asc(<expression>)
NewLine()
UrlEncode(<expression>)
UrlDecode(<expression>)
GetEncryptionKey()
Encrypt64(<expression>, <key>)
Decrypt64(<expression>, <key>)
GetLanguage()
GetMessageText(<key>[, <language>])
Iif(<condition>, <true-value>, <false-value>)
Null(<expression>)
Old(<attribute>)
Compare(<value1>, <operator>, <value2>)
Link(<object>[, <param-1>, …, <param-N>])
Shell(<program>[, <modal>[, <redirectOutput>]])
Sleep(<seconds>)
IsNull(<attribute>)
NullValue(<attribute>)
Msg(<message>)
Commit()
Rollback()
`;

// Los métodos equivalentes a funciones (Length, TrimStart, IndexOf, ...) vienen de la
// documentación de GeneXus (nexa, common-functions). La wiki documenta AddDays solo como método.
const METHODS = `
SetEmpty()
IsEmpty()
ToString()
FromString(<value>)
FromUrl(<uri>)
Day()
Month()
Year()
Hour()
Minute()
Second()
Length()
Trim()
TrimStart()
TrimEnd()
ToUpper()
ToLower()
Substring(<start>[, <length>])
Replace(<old>, <new>)
PadLeft(<length>[, <fill-char>])
PadRight(<length>[, <fill-char>])
ToNumeric()
ToFormattedString()
HTMLClean()
Round(<decimals>)
RoundToEven(<decimals>)
Int()
Truncate()
Age([<reference-expression>])
DayOfWeek()
EndOfMonth()
MonthName([<language>])
AddDays(<quantity>)
AddMonths(<quantity>)
AddYears(<quantity>)
AddSeconds(<seconds>)
Difference(<expression>)
GetOldValue()
IsNull()
SetNull()
IsMatch(<regex>)
Matches(<regex>)
ReplaceRegEx(<regex>, <expr>)
SplitRegEx(<regex>)
Add(<item>)
AddRange(<items>[, <index>])
Clear()
Clone()
IndexOf(<substr or item>[, <start>])
LastIndexOf(<substr or item>[, <start>])
Item(<index>)
Remove(<index>)
RemoveRange(<index>[, <count>])
Set(<index>, <item>)
Sort([<criteria>])
ToJson()
FromJson(<json>)
ToXml()
FromXml(<xml>)
`;

const PROPERTIES = ['Count'];

const { SIGNATURES } = require('./signatures');

// "Name(<a>[, <b>])" -> { name, sig, noArgs, params: [{ name, optional }] } (sin tipos)
function parseLine(sig) {
  const open = sig.indexOf('(');
  const inner = sig.slice(open + 1, sig.lastIndexOf(')'));
  const params = inner
    .replace(/\[\s*,/g, ',~')
    .replace(/[[\]]/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ name: s.replace(/^~/, '').replace(/[<>]/g, '').trim(), optional: s.startsWith('~') }));
  // "Name([<a>])": el corchete abre sin coma delante
  if (/^\[/.test(inner.trim()) && params.length) params[0].optional = true;
  return { name: sig.slice(0, open), sig, noArgs: inner.trim() === '', params };
}

// Firma legible con tipos: "StrSearch(String: Character, SubString: Character, [Start: Numeric]): Numeric"
const paramLabel = (q) => {
  const body = q.type ? `${q.name}: ${q.type}` : q.name;
  const rest = q.rest ? '...' : '';
  return q.optional ? `[${body}${rest}]` : `${body}${rest}`;
};
const signatureLabel = (s) =>
  `${s.name}(${s.params.map(paramLabel).join(', ')})${s.returns ? `: ${s.returns}` : ''}`;

const lines = (block) => block.trim().split('\n').map(parseLine);

// Funciones: las que tienen firma tipada (wiki) reemplazan a la entrada genérica.
const typed = new Map(SIGNATURES.map((s) => [s.name.toLowerCase(), s]));
const FUNCTIONS_LIST = lines(FUNCTIONS).map((f) => {
  const t = typed.get(f.name.toLowerCase());
  return t ? { ...f, sig: signatureLabel(t), noArgs: t.params.length === 0, typed: t } : f;
});
// Funciones tipadas que no estaban en el catálogo genérico
for (const t of SIGNATURES) {
  if (!FUNCTIONS_LIST.some((f) => f.name.toLowerCase() === t.name.toLowerCase())) {
    FUNCTIONS_LIST.push({ name: t.name, sig: signatureLabel(t), noArgs: t.params.length === 0, params: [], typed: t });
  }
}

module.exports = {
  FUNCTIONS: FUNCTIONS_LIST,
  METHODS: lines(METHODS),
  PROPERTIES,
  SIGNATURES,
  signatureLabel,
  paramLabel,
};
