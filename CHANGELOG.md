# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado semántico.

## [0.8.3]

### Agregado
- Comando **GX: Mostrar árbol de objetos**, y un aviso (una sola vez) con botón *Mostrar* la primera vez que se detecta una KB, para encontrar la vista "GeneXus" del Explorador.
- El README explica dónde está la vista.
- Clic derecho en la raíz `src`, un módulo o una carpeta del árbol "GeneXus": **Nuevo objeto GeneXus...** (no aparece en `ref`).

### Cambiado
- El icono de las Transacciones en el árbol es el mismo de las tablas, conservando su color verde.
- Se intercambiaron los iconos: los procedimientos usan el de llaves `{ }` y los módulos el del cubo.
- *Nuevo objeto GeneXus...* se quitó del menú del Explorador común: ahora está solo en el árbol "GeneXus", dentro de `src` (`ref` es de solo lectura). Sigue disponible en la paleta de comandos.

## [0.8.2]

### Cambiado
- Las carpetas `@Nombre` se muestran como carpetas, sin la arroba (convención de la KB en texto de GeneXus).
- Los objetos de las categorías `#subtypes`, `#domains`, `#images`, `#files`, `#dataviews`, `#themes` y `#designsystems` se muestran dentro de su módulo, como en la IDE. Las demás categorías (`#attributes`, `#tables`, `#preferences`, ...) siguen sin listarse.
- Orden como en la IDE: Associated Tables, módulos, carpetas y objetos.
- Iconos y colores para Image, File, DataView, Theme, DesignSystem y SubTypeGroup.

### Seguridad
- Los archivos `*.local.gx` y `*.local.*.gx` (configuración local de cada máquina, pueden traer credenciales) nunca se leen.

## [0.8.1]

### Agregado
- Cada tipo de objeto del árbol tiene su color (Transacción verde, Procedure violeta, Data Provider turquesa, Web Panel azul, SDT naranja, etc.), basado en la paleta de la IDE de GeneXus. Son colores de tema (`gxSyntax.transaction`, `gxSyntax.procedure`, ...): se adaptan a temas claros y oscuros y se pueden cambiar en `workbench.colorCustomizations`.

## [0.8.0]

### Agregado
- **Árbol de objetos** en el Explorador (vista "GeneXus"), con la forma del KB Explorer de la IDE: módulos, carpetas y objetos con su icono, nodo *Main Programs*, y bajo cada Transacción sus *Associated Tables* y los objetos de su carpeta (por ejemplo su DataProvider). Al hacer clic abre el `.gx`.
- **Buscar objeto...**: abre un objeto por nombre (botón de la vista o paleta de comandos).
- El árbol sigue al archivo activo y se actualiza solo cuando se crean, borran o cambian archivos `.gx`.
- **Índice de objetos**: se arma leyendo los `.gx` (tipo, nombre, `MainProgram`); es la base de las próximas funciones.
- Ajustes: `gxSyntax.tree.enabled` (apaga el árbol y el índice), `gxSyntax.tree.autoReveal` y `gxSyntax.index.maxFiles` (límite de archivos por KB).

### Cambiado
- *Nuevo objeto GeneXus...* aparece en el menú del Explorador solo en carpetas dentro de `src` o `ref`.
- La extensión se activa también al abrir una carpeta que contiene archivos `.gx`.

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
