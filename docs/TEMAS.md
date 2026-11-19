# Temas

Los temas **GX Dark** y **GX Light** se generan con `scripts/build-themes.js` a partir de una sola paleta. Los archivos de `themes/` son salida generada: no se editan a mano.

## Colores base

| Nombre | Hex |
|---|---|
| Azul | `#1F2F98` |
| Teal | `#06CBC1` |
| Celeste | `#7BD5F5` |
| Navy | `#081E57` |
| Lavanda claro | `#EDEEF9` |
| Lavanda medio | `#D0D7FF` |
| Violeta oscuro | `#281D57` |
| Azul eléctrico | `#2D6BFF` |

## Mapeo de colores

| Elemento | Dark | Light |
|---|---|---|
| Palabras clave, operadores de palabra | `#06CBC1` | `#1F2F98` |
| Secciones (`#Rules`, `#End`) | `#D0D7FF` | `#081E57` |
| Tipo de objeto | `#06CBC1` | `#05857E` |
| Nombre del objeto y de eventos | `#FAFAFA` | `#081E57` |
| Reglas y built-ins | `#D0D7FF` | `#281D57` |
| `&variables` | `#7BD5F5` | `#0B7FA8` |
| Atributos | `#5B8DFF` | `#2D6BFF` |
| Valor tras `Tipo:` | `#C792EA` | `#8A3FB8` |
| Propiedades y prefijos de tipo | `#D0D7FF` | `#281D57` |
| Strings | `#F2B83A` | `#9A6700` |
| Números y constantes | `#3CC884` | `#1E8E4E` |
| Comentarios | `#A3A3A3` | `#737373` |
| Barra de estado | `#081E57` | `#081E57` |

## Tonos ajustados

Algunos tonos se ajustaron respecto de los colores base para tener contraste suficiente. Quedan marcados en `build-themes.js`:

- **Dark:** azul de atributos `#5B8DFF` (el azul eléctrico se ve apagado sobre fondo oscuro), violeta `#C792EA` para los valores tras `Tipo:`, y los tonos de strings y números.
- **Light:** teal `#05857E`, celeste `#0B7FA8`, ámbar `#9A6700` y verde `#1E8E4E`, oscurecidos para leerse sobre blanco; violeta `#8A3FB8` para los valores tras `Tipo:`.

## Modificar un color

1. Editar el valor en `PALETTE` (`dark` o `light`) dentro de `scripts/build-themes.js`.
2. `npm run themes` para regenerar los archivos de `themes/`.
3. Probar con `F5` (ventana de desarrollo) o reinstalando el `.vsix`.

Para colorear un scope nuevo, agregar una línea `t([...scopes], color, estilo)` en `tokenColors`.

## Alcance de los temas

Además de los colores de código, los temas definen el fondo y primer plano del editor, la selección, el cursor, los números de línea y la barra de estado. El resto de la interfaz conserva los colores por defecto de VS Code (`vs-dark` o `vs`).

Los temas son opcionales: el resaltado funciona con cualquier tema, usando los colores que ese tema asigne a cada categoría.
