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
- **Nuevo objeto:** clic derecho en una carpeta del Explorador → *Nuevo objeto GeneXus...* (o `GX: Nuevo objeto GeneXus...` en la paleta de comandos). Elegís el tipo (Transacción, Procedure, Web Panel, Web Component, Data Provider, SDT, Domain, API, Master Page) y el nombre, y crea el `.gx` desde una plantilla.
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
src/                          comando Nuevo objeto (extension.js) y plantillas (templates.js)
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
