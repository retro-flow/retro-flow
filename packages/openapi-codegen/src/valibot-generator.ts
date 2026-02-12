import path from 'node:path'

import { format } from './formatter'
import {
  HTTP_METHODS,
  type DocumentArraySchemaObject,
  type DocumentNonArraySchemaObject,
  type DocumentSchema,
  type DocumentSchemaObject,
  type HandlerContext,
  type Operation,
  type Reference,
} from './types'
import { getComponentNameFromRef, toPascalCase } from './utils'

export async function handler(context: HandlerContext) {
  context.references.set('valibot', new Map<string, Reference>())

  const schemaFile = await format(renderSchemaFile(context))

  context.fs.write(path.resolve(context.config.output.path, 'schema.ts'), schemaFile)
}

function renderSchemaFile(context: HandlerContext) {
  const lines = []

  lines.push(`import * as v from 'valibot'`)

  lines.push(renderComponentsSchemas(context))
  lines.push(renderRequestsSchemas(context))

  return lines.join('\n')
}

function renderComponentsSchemas(context: HandlerContext) {
  const lines = []

  if (!context.document.components?.schemas) {
    return ''
  }

  for (const [name, schema] of Object.entries(context.document.components.schemas)) {
    const schemaName = `${name}${context.generators.valibot.schemaSuffix}`
    const expression = createValibotSchema(context, schema)

    context.references.get('valibot')?.set(name, { name: schemaName })

    lines.push(`export const ${schemaName} = ${expression}`)
    lines.push(`export type ${name} = v.InferInput<typeof ${schemaName}>`)
  }

  return lines.join('\n')
}

function renderRequestsSchemas(context: HandlerContext) {
  const lines = []

  for (const operations of Object.values(context.document.paths)) {
    if (operations === undefined) {
      continue
    }

    for (const method of HTTP_METHODS) {
      const operation = operations[method]

      if (operation === undefined || operation.operationId === undefined) {
        continue
      }

      const operationId = toPascalCase(operation.operationId)
      const schemaName = toPascalCase(
        `${operationId}${context.generators.valibot.requestSchemaSuffix}`,
      )
      const interfaceName = toPascalCase(
        `${operationId}${context.generators.valibot.requestInterfaceSuffix}`,
      )
      const body = createBodySchemaExpression(context, operation)
      const params = createParamsSchemaExpression(context, operation)
      const query = createQuerySchemaExpression(context, operation)

      context.references.get('valibot')?.set(operation.operationId, { name: schemaName })

      const properties = []

      if (body !== null) {
        properties.push(`body: ${body}`)
      }
      if (params !== null) {
        properties.push(`params: ${params}`)
      }
      if (query !== null) {
        properties.push(`query: ${query}`)
      }

      lines.push(`
        export const ${schemaName} = v.object({ ${properties.join(',')}})
      `)
      lines.push(`export type ${interfaceName} = v.InferOutput<typeof ${schemaName}>`)
    }
  }

  return lines.join('\n\n')
}

function createValibotSchema(context: HandlerContext, schema: DocumentSchema): string {
  if (typeof schema !== 'object') {
    return 'v.unknown()'
  }

  if (Array.isArray(schema)) {
    return 'v.unknown()'
  }

  if ('$ref' in schema) {
    const reference = getComponentNameFromRef(schema.$ref)

    if (reference !== null && context.document.components?.schemas?.[reference]) {
      const targetExport = getExportSchemaName(context, reference)
      return `v.lazy(() => ${targetExport})`
    }

    return 'v.unknown()'
  }

  const isNullable =
    schema.nullable === true || (Array.isArray(schema.type) && schema.type.includes('null'))

  if ((schema as any).const) {
    return `v.literal(${JSON.stringify((schema as any).const)})`
  }

  if (schema.enum?.length) {
    const literals = schema.enum.map((literal) => `v.literal(${JSON.stringify(literal)})`)
    const expression = `v.union([${literals.join(',')}])`
    return isNullable ? `v.nullable(${expression})` : expression
  }

  if (schema.oneOf?.length) {
    const variants = schema.oneOf.map((schema) => createValibotSchema(context, schema)).join(', ')
    const expression = `v.union([${variants}])`
    return isNullable ? `v.nullable(${expression})` : expression
  }

  if (schema.anyOf?.length) {
    const variants = schema.anyOf.map((schema) => createValibotSchema(context, schema)).join(', ')
    const expression = `v.union([${variants}])`
    return isNullable ? `v.nullable(${expression})` : expression
  }

  if (schema.allOf?.length) {
    const expressions = schema.allOf
      .map((schema) => createValibotSchema(context, schema))
      .join(', ')
    const expression = `v.intersect([${expressions}])`
    return isNullable ? `v.nullable(${expression})` : expression
  }

  let expression = `v.never()`

  switch (schema.type) {
    case 'string': {
      expression = applyStringConstraints('v.string()', schema)
      break
    }
    case 'integer': {
      expression = applyNumberConstraints('v.pipe(v.number(), v.integer())', schema)
      break
    }
    case 'number': {
      expression = applyNumberConstraints('v.number()', schema)
      break
    }
    case 'boolean': {
      expression = 'v.boolean()'
      break
    }
    case 'array': {
      const values = createValibotSchema(context, schema.items)
      expression = applyArrayConstraints(`v.array(${values})`, schema)
      break
    }
    case 'object':
    default: {
      const properties = schema.properties ?? {}
      const additionalProperties = schema.additionalProperties
      if (Object.keys(properties).length === 0 && typeof additionalProperties === 'object') {
        const values = createValibotSchema(context, additionalProperties)
        expression = `v.record(v.string(), ${values})`
        break
      }
      expression = objectSchemaToValibot(context, schema)
      break
    }
  }

  return isNullable ? `v.nullable(${expression})` : expression
}

function objectSchemaToValibot(context: HandlerContext, schema: DocumentSchemaObject) {
  const props = schema.properties ?? {}
  const entries = []

  for (const [name, prop] of Object.entries(props)) {
    const propExpression = createValibotSchema(context, prop)
    const isRequired = schema.required?.includes(name)
    const expression = isRequired ? propExpression : `v.optional(${propExpression})`
    entries.push(`${name}: ${expression}`)
  }

  return `v.object({ ${entries.join(',')} })`
}

function applyStringConstraints(base: string, schema: DocumentNonArraySchemaObject) {
  const pipes = []

  if (schema.format === 'email') {
    pipes.push('v.email()')
  }
  if (schema.format === 'uuid') {
    pipes.push('v.uuid()')
  }
  if (schema.format === 'uri' || schema.format === 'url') {
    pipes.push('v.url()')
  }

  // TODO: Customs.
  if (schema.format === 'date-time') {
    base = 'v.date()'
    pipes.push('v.transform((value) => value.toISOString())')
  }

  if (typeof schema.minLength === 'number') {
    pipes.push(`v.minLength(${schema.minLength})`)
  }
  if (typeof schema.maxLength === 'number') {
    pipes.push(`v.maxLength(${schema.maxLength})`)
  }
  if (typeof schema.pattern === 'string') {
    pipes.push(`v.regex(new RegExp(${JSON.stringify(schema.pattern)}))`)
  }

  return pipes.length ? `v.pipe(${base}, ${pipes.join(', ')})` : base
}

function applyNumberConstraints(base: string, schema: DocumentNonArraySchemaObject) {
  const pipes = []

  // TODO: Customs.
  if (schema.format === 'decimal') {
    base = 'v.any()'
    pipes.push('v.transform((value: { toNumber: () => number }) => value.toNumber())')
  }

  if (typeof schema.minimum === 'number') {
    pipes.push(`v.minValue(${schema.minimum})`)
  }
  if (typeof schema.maximum === 'number') {
    pipes.push(`v.maxValue(${schema.maximum})`)
  }

  return pipes.length ? `v.pipe(${base}, ${pipes.join(', ')})` : base
}

function applyArrayConstraints(base: string, schema: DocumentArraySchemaObject) {
  const pipes = []

  if (typeof schema.minItems === 'number') {
    pipes.push(`v.minLength(${schema.minItems})`)
  }
  if (typeof schema.maxItems === 'number') {
    pipes.push(`v.maxLength(${schema.maxItems})`)
  }

  return pipes.length ? `v.pipe(${base}, ${pipes.join(', ')})` : base
}

function getExportSchemaName(context: HandlerContext, name: string) {
  return `${name}${context.generators.valibot.schemaSuffix}`
}

function createQuerySchemaExpression(_context: HandlerContext, _operation: Operation) {
  return null
}

function createParamsSchemaExpression(context: HandlerContext, operation: Operation) {
  if (!operation.parameters) {
    return null
  }
  if ('$ref' in operation.parameters) {
    return null
  }

  const entries = []

  for (const param of operation.parameters) {
    if ('$ref' in param || param.in !== 'path' || !param.schema) {
      continue
    }

    const value = createValibotSchema(context, param.schema)
    const isRequired = param.required
    const expression = isRequired
      ? `${param.name}: ${value}`
      : `${param.name}: v.optional(${value})`
    entries.push(expression)
  }

  return `v.object({${entries.join(',')}})`
}

function createBodySchemaExpression(context: HandlerContext, operation: Operation) {
  if (!operation.requestBody) {
    return null
  }
  if ('$ref' in operation.requestBody) {
    return null
  }

  const isRequired = operation.requestBody.required
  const content = operation.requestBody.content['application/json']

  if (!content?.schema) {
    return null
  }

  const schema = createValibotSchema(context, content.schema)
  const expression = isRequired ? schema : `v.optional(${schema})`

  return expression
}
