# Gramática

Archivo: `syntaxes/gx.tmLanguage.json` · scope raíz: `source.gx` · lenguaje: `genexus-gx`.

## El formato `.gx`

Cada archivo describe un objeto de la KB:

```
Transaction Customer
{
    CustomerId* [ DataType = 'Numeric(8.0)', Autonumber = 'True' ]
    CustomerName! [ DataType = 'VarChar(60)' ]

    #Rules
        noaccept(CustomerId);
    #End

    #Events
        Event Start
            ...
        EndEvent
    #End

    #Properties
        Name = "Customer"
    #End
}
```

Hay tres zonas con reglas distintas: el **encabezado** (primera línea), las **secciones** `#Nombre ... #End` y el **cuerpo** del objeto.

## Contextos

La primera línea decide cómo se interpreta el cuerpo:

| Regla | Objetos | Cuerpo |
|---|---|---|
| `code-object` | `Procedure`, `WebPanel`, `WebComponent`, `DataProvider`, `API`, `MasterPage`, `SDPanel`, `DataSelector` | Código GeneXus |
| `structure-object` | Todo lo demás (`Transaction`, `Table`, `SDT`, `Attribute`, `Domain`, `Environment`, ...) | Declaraciones de atributos y propiedades |

Dentro de cada objeto, las secciones cambian el contexto:

| Sección | Contenido |
|---|---|
| `#Rules`, `#Events`, `#Conditions`, `#Source`, `#Code`, `#Formula(s)`, `#Calculation(s)` | Código GeneXus |
| `#Variables` | Declaraciones de variables con lista de propiedades |
| `#Properties` | Asignaciones `Clave = valor` |
| `#Documentation` | Markdown |
| Cualquier otra (`#Indexes`, `#Backend`, `#Frontend`, `#References`, ...) | Estructura genérica |

Un archivo que no empieza con un encabezado reconocido (por ejemplo, una parte suelta) cae en el modo de secciones y código.

## Scopes

| Elemento | Scope |
|---|---|
| Tipo de objeto (`Transaction`) | `storage.type.class.gx` |
| Nombre del objeto | `entity.name.type.class.gx` |
| Marcador de sección (`#Rules`, `#End`) | `keyword.control.section.gx` + `punctuation.definition.section.gx` |
| Palabras de control (`if`, `for each`, `do case`, `return`, ...) | `keyword.control.gx` |
| `Event` / `Sub` y su nombre | `keyword.control.declaration.gx` + `entity.name.function.event.gx` |
| Referencia a subrutina (`Do 'Nombre'`) | `entity.name.function.subroutine.gx` |
| Operadores de palabra (`and`, `or`, `not`, `like`) | `keyword.operator.word.gx` |
| Reglas (`parm`, `noaccept`, ...) | `support.function.rule.gx` |
| Funciones built-in (`Format`, `Trim`, ...) | `support.function.builtin.gx` |
| Otras llamadas a función | `entity.name.function.call.gx` |
| Método (`.IsEmpty()`) | `entity.name.function.method.gx` |
| Propiedad (`.Class`, `.Visible`) | `variable.other.property.gx` |
| Variable (`&nombre`) | `variable.other.gx` |
| Atributo (identificador suelto) | `variable.other.constant.attribute.gx` |
| Nombre declarado en `#Variables` | `variable.other.declaration.gx` |
| Prefijo de tipo (`TrnMode`, `StyleClass`) | `support.class.gx` |
| Valor tras `Tipo:` | `support.constant.enum.gx` |
| `in` / `out` / `inout` de `parm()` | `storage.modifier.parameter-direction.gx` |
| Etiqueta de plataforma (`[web]`) | `entity.other.attribute-name.platform.gx` |
| Strings `"..."`, `!"..."`, `'...'` | `string.quoted.double.gx`, `string.quoted.double.nontranslatable.gx`, `string.quoted.single.gx` |
| Números, `true` / `false` / `null` | `constant.numeric.gx`, `constant.language.gx` |
| Comentarios | `comment.line.double-slash.gx`, `comment.block.gx` |
| Clave de propiedad (`DataType =`) | `variable.other.property.gx` |

## Orden de las reglas de código

En la regla `code` el orden importa: la primera que coincide gana. En resumen: comentarios y strings, etiquetas `[web]`, `Event`/`Sub`, `Tipo:Valor`, dirección de `parm`, variables, acceso a miembros, reglas y built-ins, palabras clave, llamadas a función, operadores de palabra, constantes, prefijos de tipo, números, atributos y, por último, operadores.

Dos consecuencias a tener presentes:

- Las palabras clave van **antes** que las llamadas a función, para que `New()` se pinte como palabra clave.
- Los atributos son la **última** regla: todo identificador que no haya sido capturado antes se considera atributo.

## Limitaciones conocidas

- Los nombres de controles (`BtnToggle`, `AdvancedContainer`) no se distinguen de los atributos.
- Las palabras clave de varias palabras (`for each`, `do case`, `defined by`) se reconocen solo si están separadas por espacios en la misma línea.
- El lenguaje es insensible a mayúsculas: las palabras clave se reconocen en cualquier combinación.

## Cómo agregar una regla

1. Escribir el caso en un archivo de `samples/`.
2. Agregar la regla en `repository` e incluirla en `code` (o `structure`) en la posición correcta.
3. Agregar la verificación en `scripts/tokenize-check.js`.
4. Correr `npm test`. Para ver los tokens de un archivo: `node scripts/tokenize-check.js dump samples/Archivo.gx`.
5. Si el scope es nuevo, asignarle color en `scripts/build-themes.js` y correr `npm run themes`.
