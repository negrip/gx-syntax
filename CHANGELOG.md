# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado semántico.

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
