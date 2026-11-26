# GX Syntax

Extensión de VS Code que agrega **resaltado de sintaxis** a los archivos `.gx` de GeneXus (el formato de texto de los objetos de una Knowledge Base) e incluye dos temas de color opcionales.

Es declarativa: solo una gramática TextMate y dos temas. No ejecuta código, no incluye servidores ni binarios y no necesita red.

## Características

- **Estructura del objeto:** tipo y nombre (`Transaction`, `Procedure`, `WebPanel`, `DataProvider`, `SDT`, `Table`, ...).
- **Secciones:** `#Rules`, `#Events`, `#Conditions`, `#Variables`, `#Properties`, `#Indexes`, `#Documentation` y cualquier otra, hasta `#End`.
- **Código GeneXus:** `If/Else/Endif`, `For Each`, `Do Case`, `Event`/`Sub`, `&variables`, reglas (`parm`, `noaccept`, ...), funciones, métodos, `TrnMode.Insert`, `StyleClass:Nombre`, strings (`"..."`, `!"..."`) y comentarios (`//`, `/* */`).
- **Atributos** de la base de datos, tanto en su declaración (`CustomerId*`, `CustomerName!`) como en su uso dentro del código.
- **Propiedades:** `Clave = "valor"` y listas `[ DataType = '...', ... ]`.
- **`#Documentation`** resaltado como Markdown.
- **Plegado** de secciones y de bloques `Event`/`Sub`.
- **Temas** `GX Dark` y `GX Light` (opcionales).
- **Nuevo objeto:** clic derecho en `src`, un módulo o una carpeta del árbol **GeneXus** → *Nuevo objeto GeneXus...* (o `GX: Nuevo objeto GeneXus...` en la paleta de comandos). Elegís el tipo (Transacción, Procedure, Web Panel, Web Component, Data Provider, SDT, Domain, API, Master Page) y el nombre, y crea el `.gx` desde una plantilla.
- **Navegación por secciones:** `Ctrl+Alt+S` (o clic derecho → *Ir a sección...*) lista las secciones, `Event` y `Sub` del archivo y salta a la elegida; `Ctrl+Alt+B` vuelve a donde estabas. Las secciones también aparecen en el **Outline**, en las migas de pan y con `Ctrl+Shift+O`.
- **Autocompletado** de funciones y métodos de GeneXus: se insertan con paréntesis (`&x.SetEmpty()`); si llevan parámetros, el cursor queda dentro. Al escribir `&` sugiere las variables del objeto (declaradas, usadas y del sistema) y, fuera de `&`, sus atributos.
- **Ayuda de firma:** al escribir `(` o `,` muestra los parámetros con su tipo y el tipo de retorno de la función, y resalta el parámetro activo. Cubre 36 funciones de uso frecuente, con enlace a la wiki de GeneXus.
- **Árbol de objetos:** una vista "GeneXus" en el Explorador que organiza los `.gx` como el KB Explorer de la IDE (módulos, carpetas, objetos con icono, *Main Programs*, tablas asociadas). Aparece sola al abrir una carpeta de KB (`src`, `ref`, la carpeta que las contiene o cualquiera con archivos `.gx`); en proyectos sin `.gx` no aparece. Incluye **Buscar objeto...** y sigue al archivo activo.

  **¿Dónde está?** En el Explorador (el primer icono de la barra lateral izquierda, o `Ctrl+Shift+E`), como un panel más llamado **GeneXus**, en la lista de paneles *WorkSpace*, *Outline*, *Timeline*. Suele estar cerrado y abajo del todo: hacé clic en su título para desplegarlo. Si no lo encontrás, `Ctrl+Shift+P` → **GX: Mostrar árbol de objetos** lo abre. La primera vez que se detecta una KB, la extensión muestra un aviso con un botón **Mostrar**. Para tener más espacio, arrastrá el título del panel hacia arriba o hacia la barra de iconos de la izquierda.
- **Snippets** de sintaxis GeneXus: `if`, `foreach`, `forin`, `docase`, `event`, `sub`, `new`, `parm`, `#rules`, `#variables`, etc.

## Instalación

1. Entrá a [Releases](https://github.com/negrip/gx-syntax/releases/latest) y descargá el archivo `gx-syntax-<versión>.vsix`.
2. Instalalo desde la terminal:

```powershell
code --install-extension gx-syntax-<versión>.vsix --force
```

Para actualizar, repetí los pasos con el `.vsix` de la versión nueva.

Luego ejecutar **Developer: Reload Window**. También se puede instalar desde la vista de Extensiones: menú `...` → **Install from VSIX...**.

Los archivos `.gx` se asocian solos al lenguaje **GeneXus (GX)** (id `genexus-gx`). Se ve en la barra de estado, abajo a la derecha.

> Si tenés instalada otra extensión que también registra `.gx` (por ejemplo `GeneXus KB Text Support`), deshabilitá una de las dos: compiten por la misma extensión de archivo.

### Elegir un tema

`Ctrl+K Ctrl+T` y elegir **GX Dark** o **GX Light**. Los temas son opcionales: sin ellos, el resaltado usa los colores de tu tema actual.

### Ajustes

| Ajuste | Por defecto | Qué hace |
|---|---|---|
| `gxSyntax.tree.enabled` | `true` | Muestra el árbol de objetos y arma el índice. En `false` no se lee ningún archivo. |
| `gxSyntax.tree.autoReveal` | `true` | Selecciona en el árbol el objeto del archivo activo. |
| `gxSyntax.index.maxFiles` | `20000` | Máximo de archivos `.gx` que se leen por carpeta de KB. |

Los colores de los iconos son colores de tema y se pueden cambiar en `settings.json`, por ejemplo:

```json
"workbench.colorCustomizations": { "gxSyntax.procedure": "#ff8800" }
```

Los identificadores disponibles están en `package.json`, sección `contributes.colors` (`gxSyntax.transaction`, `gxSyntax.webPanel`, ...).

El árbol se arma solo con lo que hay en los archivos: una carpeta con `module.toml` es un módulo, las carpetas `#...` no se muestran, y una carpeta `@Nombre` es una carpeta de la IDE (se muestra sin la arroba), una carpeta con el nombre de un objeto vecino (`City.gx` + `City/`) cuelga de ese objeto, y los objetos de `#domains`, `#images`, `#subtypes` y similares se muestran dentro de su módulo. No está conectado a la KB.

## Documentación

| Documento | Contenido |
|---|---|
| [docs/GRAMATICA.md](docs/GRAMATICA.md) | Cómo está armada la gramática y la tabla de scopes |
| [docs/TEMAS.md](docs/TEMAS.md) | Paleta, mapeo de colores y cómo modificarla |
| [docs/DESARROLLO.md](docs/DESARROLLO.md) | Estructura del proyecto, pruebas, empaquetado y release |
| [CHANGELOG.md](CHANGELOG.md) | Historial de versiones |

## Estructura

```
syntaxes/gx.tmLanguage.json   gramática TextMate
language-configuration.json   comentarios, paréntesis, plegado
src/                          extensión: comandos (extension.js), plantillas, secciones, símbolos, catálogo y firmas de funciones
snippets/                     snippets de código
themes/                       temas generados (no editar a mano)
scripts/build-themes.js       paleta única y generador de temas
scripts/tokenize-check.js     pruebas de tokens
samples/                      4 ejemplos .gx genéricos (usados por las pruebas)
docs/                         documentación
```

## Desarrollo rápido

```powershell
npm install
npm test           # verifica los scopes sobre samples/
npm run themes     # regenera los temas desde la paleta
npm run package    # genera el .vsix
```

Detalle en [docs/DESARROLLO.md](docs/DESARROLLO.md).

## Limitaciones

- Es solo resaltado de sintaxis: no hay autocompletado, validación ni navegación.
- La gramática no conoce tu KB. Un identificador suelto se pinta como atributo aunque sea el nombre de un control (por ejemplo `BtnToggle`).
- Los colores finales dependen del tema activo; el resaltado solo asigna categorías.

## Licencia

MIT. Ver [LICENSE](LICENSE).
