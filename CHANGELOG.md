# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado semántico.

## [0.7.1]

### Corregido
- Al escribir una palabra suelta (por ejemplo `Str`) el autocompletado ofrecía solo métodos y no las funciones (`StrSearch`...): unas expresiones regulares del proveedor estaban mal escritas.
- Las sugerencias de variables y atributos fallaban con un error interno.
- Se agregó una prueba del proveedor de autocompletado para detectar estas regresiones.

## [0.7.0]

### Agregado
- **Ayuda de firma** al escribir `(` o `,`: muestra los parámetros con su tipo y el tipo de retorno (por ejemplo `StrSearch(String: Character, SubString: Character, [Start: Numeric]): Numeric`) y resalta el parámetro activo. Cubre 36 funciones de uso frecuente (texto, fecha y hora, numéricas, `Iif`, `IsNull`, `Link`...), con enlace a su página de la wiki de GeneXus. Los métodos muestran sus parámetros sin tipo.
- Más métodos equivalentes a funciones en el autocompletado: `Length`, `TrimStart`, `TrimEnd`, `ToUpper`, `ToLower`, `Substring`, `Replace`, `PadLeft`, `PadRight`, `AddDays`, `AddMonths`, `AddYears`, `Truncate`, entre otros.

### Cambiado
- `AddDays` se ofrece solo como método (`&fecha.AddDays(n)`), porque la wiki no lo documenta como función.
- `Trunc` muestra dos parámetros (valor y decimales), como en la wiki.

## [0.6.0]

### Agregado
- Autocompletado de **variables** al escribir `&`: las declaradas en `#Variables`/`#Parameters`, las usadas con `&` en el código (por ejemplo las de `parm`) y las del sistema (`Today`, `Time`, `Pgmname`, `Pgmdesc`), con su tipo cuando está declarado.
- Autocompletado de **atributos** declarados en el objeto (Transaction, SDT, etc.).

## [0.5.0]

### Agregado
- **Autocompletado** de funciones (`Trim`, `Today`, `Iif`, ...) y métodos (`.SetEmpty()`, `.IsEmpty()`, `.Add()`, ...). Al aceptar la sugerencia se inserta con paréntesis; si lleva parámetros, el cursor queda dentro. Después de `.` se ofrecen métodos; en otro lugar, funciones.

## [0.4.0]

### Agregado
- **Ir a sección...** (`Ctrl+Alt+S`): lista secciones, `Event` y `Sub` del `.gx` y salta a la elegida.
- **Volver a la posición anterior** (`Ctrl+Alt+B`), con pila propia de saltos.
- Las secciones y los `Event`/`Sub` aparecen en el Outline, las migas de pan y `Ctrl+Shift+O`.

## [0.3.0]

### Agregado
- Comando **Nuevo objeto GeneXus...** (menú contextual del Explorador y paleta de comandos) con plantillas para Transaction, Procedure, WebPanel, WebComponent, DataProvider, SDT, Domain, API y MasterPage.
- Las plantillas de DataProvider y Domain dejan vacías las propiedades que el usuario debe completar (`Output`, `Collection`, `CollectionName`, `DataType`, `Length`, `Decimals`); DataProvider incluye `MainProgram = "True"`.
- Cada plantilla incluye al inicio un comentario que avisa que es un ejemplo y que hay que verificar los campos.
- Plantilla **Data Selector**; la gramática reconoce `#Parameters` (como declaraciones, con `&`), `#Orders` y `#DefinedBy`.
- Snippets de código GeneXus (`if`, `foreach`, `docase`, `event`, `sub`, `parm`, secciones `#...`, etc.).

## [0.2.1]

### Agregado
- Scope propio para el valor posterior a `Tipo:` (por ejemplo `BtnToggle` en `StyleClass:BtnToggle`), con color distinto al de los atributos.
- Colores de la barra de estado (navy) en ambos temas.

### Cambiado
- Los atributos usan un azul más claro en el tema Dark para mejorar el contraste.

## [0.2.0]

### Agregado
- Temas **GX Dark** y **GX Light**, generados desde una única paleta (`scripts/build-themes.js`).

## [0.1.2]

### Cambiado
- La declaración de atributos en `Transaction`, `Table` y `SDT` usa el mismo scope que el atributo usado en el código.

## [0.1.1]

### Agregado
- Resaltado de atributos: identificadores sueltos (sin `&`) en reglas, eventos, condiciones y cuerpos de código.

## [0.1.0]

### Agregado
- Primera versión: gramática TextMate para `.gx` (encabezado, secciones, código, propiedades, listas de propiedades, `#Documentation` como Markdown), configuración del lenguaje con plegado y pruebas de tokens.
