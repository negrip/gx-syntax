'use strict';
// Plantillas propias para "Nuevo objeto GeneXus". Cada una recibe el nombre del objeto.
// Se mantienen mínimas a propósito: la estructura del archivo, no lógica de negocio.

const props = (name, extra = []) =>
  ['\t#Properties', `\t\tName = "${name}"`, ...extra.map((l) => `\t\t${l}`), '\t#End'].join('\n');

const TEMPLATES = [
  {
    type: 'Transaction',
    label: 'Transacción',
    detail: 'Transaction con clave autonumerada, Rules y Events',
    build: (n) => `Transaction ${n}
{
	${n}Id* [ DataType = 'Numeric(10.0)', Autonumber = 'True' ]

	${n}Name! [ DataType = 'VarChar(64)' ]

	#Rules
		
	#End

	#Events
		
	#End

${props(n)}
}
`,
  },
  {
    type: 'Procedure',
    label: 'Procedure',
    detail: 'Procedure con parm, código y variables',
    build: (n) => `Procedure ${n}
{
	// Código del procedimiento

	#Rules
		parm(in:&Param, out:&Result);
	#End

	#Variables
		Param [ DataType = 'VarChar(100)' ]

		Result [ DataType = 'Boolean' ]
	#End

${props(n)}
}
`,
  },
  {
    type: 'WebPanel',
    label: 'Web Panel',
    detail: 'WebPanel con Event Start y Conditions',
    build: (n) => `WebPanel ${n}
{
	#Events
		Event Start
			
		EndEvent
	#End

	#Conditions
		
	#End

	#Variables
		
	#End

${props(n)}
}
`,
  },
  {
    type: 'WebComponent',
    label: 'Web Component',
    detail: 'WebComponent con parm y Event Start',
    build: (n) => `WebComponent ${n}
{
	#Rules
		parm(in:&Id);
	#End

	#Events
		Event Start
			
		EndEvent
	#End

	#Variables
		Id [ DataType = 'Numeric(10.0)' ]
	#End

${props(n)}
}
`,
  },
  {
    type: 'DataProvider',
    label: 'Data Provider',
    detail: 'DataProvider con salida y propiedades de colección',
    build: (n) => `DataProvider ${n}
{
	/*
	CollectionName
	{
		Item
		{
			Attribute = 
		}
	}
	*/

${props(n, ['MainProgram = "True"', 'Output = ""', 'Collection = ""', 'CollectionName = ""'])}
}
`,
  },
  {
    type: 'DataSelector',
    label: 'Data Selector',
    detail: 'DataSelector con Parameters, Conditions, Orders y DefinedBy',
    build: (n) => `DataSelector ${n}
{
	#Parameters
		
	#End

	#Conditions
		
	#End

	#Orders
		
	#End

	#DefinedBy
		
	#End

${props(n)}
}
`,
  },
  {
    type: 'SDT',
    label: 'SDT (Structured Data Type)',
    detail: 'Tipo de dato estructurado',
    build: (n) => `SDT ${n}
{
	${n}{

		id [ DataType = 'Numeric(10.0)' ]

		name [ DataType = 'VarChar(100)' ]

		items [ DataType = 'VarChar(100)', Collection = 'True', CollectionItemName = 'itemsItem' ]

	}

${props(n)}
}
`,
  },
  {
    type: 'Domain',
    label: 'Domain',
    detail: 'Dominio con tipo, longitud y decimales',
    build: (n) => `Domain ${n}
{
${props(n, ['DataType = ""', 'Length = ""', 'Decimals = ""'])}
}
`,
  },
  {
    type: 'API',
    label: 'API (Business Component / REST)',
    detail: 'API con un servicio de ejemplo',
    build: (n) => `API ${n}
{
	${n}Service{

		Get(in:&Id, out:&Result)
		=> ${n}Procedure(&Id, &Result);

	}

	#Variables
		Id [ DataType = 'Numeric(10.0)' ]

		Result [ DataType = 'VarChar(100)' ]
	#End

${props(n)}
}
`,
  },
  {
    type: 'MasterPage',
    label: 'Master Page',
    detail: 'Master Page',
    build: (n) => `MasterPage ${n}
{
	#Variables
		
	#End

${props(n, ['Type = "Master Page"'])}
}
`,
  },
];

// Aviso al inicio del cuerpo de cada objeto nuevo.
const AVISO = '\t// PLANTILLA DE EJEMPLO: verificá y completá los campos antes de usar este objeto.\n\n';
for (const t of TEMPLATES) {
  const build = t.build;
  t.build = (n) => build(n).replace('{\n', '{\n' + AVISO);
}

module.exports = { TEMPLATES };
