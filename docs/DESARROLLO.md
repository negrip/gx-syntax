# Desarrollo

## Requisitos

- Node.js 18 o superior y npm.
- VS Code 1.80 o superior.

```powershell
npm install
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm test` | Tokeniza `samples/` y verifica los scopes esperados |
| `node scripts/tokenize-check.js dump samples/Customer.gx` | Imprime los tokens y scopes de un archivo |
| `npm run themes` | Regenera `themes/` desde la paleta |
| `npm run package` | Genera el `.vsix` |

## Estructura

```
package.json                  manifiesto: lenguaje, gramática, temas
language-configuration.json   comentarios, paréntesis, autocierre, plegado
syntaxes/gx.tmLanguage.json   gramática
themes/                       generado por npm run themes
scripts/build-themes.js       paleta y generador de temas
scripts/tokenize-check.js     pruebas
samples/                      ejemplos .gx
docs/                         documentación
```

## Probar en VS Code sin instalar

Abrir la carpeta del proyecto en VS Code y presionar `F5` abre una ventana de desarrollo con la extensión cargada. Si el proyecto no tiene configuración de depuración, alcanza con crear `.vscode/launch.json` con una configuración de tipo `extensionHost` apuntando a `${workspaceFolder}`.

## Pruebas

`scripts/tokenize-check.js` usa `vscode-textmate` y `vscode-oniguruma`, los mismos motores que VS Code, para tokenizar los archivos de `samples/`. La lista `EXPECT` contiene tuplas `[archivo, texto del token, fragmento del scope esperado]`.

- Las comillas y delimitadores son tokens aparte: un string `'abc'` produce el token `abc` con scope `string.quoted.single`, no `'abc'`.
- Una verificación pasa si existe algún token con ese texto y ese scope en el archivo.
- El Markdown embebido de `#Documentation` no se resuelve en las pruebas (no se carga la gramática de Markdown).

Al corregir un resaltado: agregar primero un caso en `samples/`, después la verificación y por último ajustar la gramática.

## Empaquetar

```powershell
npm run package
```

Genera `gx-syntax-<versión>.vsix` en la raíz. El archivo `.vscodeignore` deja afuera `node_modules`, `scripts`, `samples` y `docs`. Los `.vsix` no se versionan.

## Publicar una versión

1. Actualizar `version` en `package.json`.
2. Agregar la entrada en `CHANGELOG.md`.
3. Actualizar el nombre del `.vsix` en `README.md`.
4. `npm run themes` y `npm test`.
5. `npm run package` y probar la instalación con `--force`.
6. Commit y tag: `git tag v<versión>`.

## Convenciones

- Versionado semántico: cambios de resaltado compatibles suben el patch; scopes o colores nuevos, el minor.
- Mensajes de commit en español, en imperativo y breves.
- No editar `themes/` a mano.
- Los archivos de `samples/` son ejemplos genéricos escritos para este proyecto (`Customer`, `ProductList`, `CalcTotal`, `Invoice`); no copiar objetos de una KB real ni incluir datos de clientes.

## Ideas a futuro

- Snippets para `For Each`, `Do Case`, `Event` y `Sub`.
- Ícono para archivos `.gx`.
- Más objetos de ejemplo genéricos (API, WebComponent, Domain, SDT anidados) en `samples/`.
- Funciones que requieran conocer la KB (autocompletado, ir a definición) son un proyecto aparte: necesitan código en TypeScript y una fuente de datos de la KB.
