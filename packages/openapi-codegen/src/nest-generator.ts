import path from 'node:path'

import { format } from './formatter'
import { HTTP_METHODS, type Document, type HandlerContext, type Operation } from './types'
import { getComponentNameFromRef, toPascalCase } from './utils'

export async function handler(context: HandlerContext) {
  const controllers = collectControllersByTag(context.document)
  const controllersFile = await format(renderControllersFile(context, controllers))

  context.fs.write(path.resolve(context.config.output.path, 'controllers.ts'), controllersFile)
}

interface ControllerOperation {
  id: string
  tag: string
  path: string
  method: string
  operation: Operation
}

function collectControllersByTag(document: Document) {
  const result = new Map<string, ControllerOperation[]>()

  for (const [path, operations] of Object.entries(document.paths)) {
    if (operations === undefined) {
      continue
    }

    for (const method of HTTP_METHODS) {
      const operation = operations[method]

      if (operation === undefined) {
        continue
      }

      const id = operation.operationId
      const tag = operation.tags?.at(0) ?? 'Default'

      if (!id) {
        throw new Error('Operation id is missing')
      }

      if (!result.has(tag)) {
        result.set(tag, [])
      }

      result.get(tag)?.push({ tag, path, method, id, operation })
    }
  }

  for (const [_, operations] of result) {
    operations.sort((a, b) => a.id.localeCompare(b.id))
  }

  return new Map([...result.entries()].sort((a, b) => a[0].localeCompare(b[0])))
}

function renderControllersFile(
  context: HandlerContext,
  controllers: Map<string, ControllerOperation[]>,
) {
  const lines: string[] = []
  const nestImports = new Set<string>(['Controller'])

  lines.push(`import * as v from 'valibot'`)
  lines.push(`import { ValibotPipe } from '@retro-flow/nest-common/valibot'`)
  lines.push(`import * as schema from './schema'`)

  for (const [tag, operations] of controllers.entries()) {
    const className = `${toPascalCase(tag)}ControllerImpl`
    const methods: string[] = []

    for (const operation of operations) {
      const decorator = getHttpDecoratorName(operation.method)
      const path = getNestPath(operation.path)

      const isParamsExists = isDataExists(operation.operation, 'path')
      const isQueryExists = isDataExists(operation.operation, 'query')
      const isBodyExists = isDataExists(operation.operation, 'body')

      nestImports.add(decorator)

      const reference = context.references.get('valibot')?.get(operation.id)

      if (!reference) {
        throw new Error('Request reference is not found')
      }

      const responseType = createSuccessResponseType(context, operation.operation)
      const responseMapper = createSuccessMapper(context, operation.operation)

      const privateMethodName = `${operation.id}Handler`
      const publicMethodName = operation.id
      const interfaceName = toPascalCase(
        `${operation.id}${context.generators.valibot.requestInterfaceSuffix}`,
      )

      const privateParams = []
      const forwardedParams = []

      if (isParamsExists) {
        nestImports.add('Param')

        privateParams.push(
          `@Param(new ValibotPipe(schema.${reference.name}.entries.params)) params: schema.${interfaceName}['params']`,
        )

        forwardedParams.push('params')
      }

      if (isQueryExists) {
        nestImports.add('Query')

        privateParams.push(
          `@Query(new ValibotPipe(schema.${reference.name}.entries.query)) query: schema.${interfaceName}['query']`,
        )

        forwardedParams.push('query')
      }

      if (isBodyExists) {
        nestImports.add('Body')

        privateParams.push(
          `@Body(new ValibotPipe(schema.${reference.name}.entries.body)) body: schema.${interfaceName}['body']`,
        )

        forwardedParams.push('body')
      }

      methods.push(`
        @${decorator}('${path}')
        private async ${privateMethodName} (${privateParams.join(',')}) {
          ${
            forwardedParams.length > 0
              ? `return this.${publicMethodName}({ ${forwardedParams.join(', ')} })`
              : `return this.${publicMethodName}()`
          }
        }
      `)

      methods.push(`
        async ${publicMethodName} (${forwardedParams.length > 0 ? `data: schema.${interfaceName}` : ''}): Promise<${responseType}> {
          throw new Error('Not implemented')
        }
      `)

      if (responseMapper !== null) {
        methods.push(responseMapper)
      }
    }

    lines.push([`@Controller()`, `export class ${className} {`, methods.join('\n'), `}`].join('\n'))
  }

  lines.unshift(`import { ${Array.from(nestImports).join(', ')} } from '@nestjs/common'`)

  return lines.join('\n')
}

function getNestPath(path: string) {
  return path.replace(/\{([^}]+)\}/g, ':$1')
}

function getHttpDecoratorName(method: string) {
  switch (method) {
    case 'get':
      return 'Get'
    case 'post':
      return 'Post'
    case 'put':
      return 'Put'
    case 'delete':
      return 'Delete'
    default:
      throw new Error('Method not supported')
  }
}

function isDataExists(operation: Operation, where: 'path' | 'query' | 'body') {
  if (where === 'body') {
    if (operation.requestBody === undefined || '$ref' in operation.requestBody) {
      return false
    }

    return 'application/json' in operation.requestBody.content
  }

  if (operation.parameters === undefined || '$ref' in operation.parameters) {
    return false
  }

  return operation.parameters.some((parameter) => {
    if ('$ref' in parameter) {
      return false
    }

    return parameter.in === where
  })
}

function createSuccessResponseType(context: HandlerContext, operation: Operation) {
  const responses = operation.responses

  if (!responses) {
    return 'unknown'
  }

  const status = Object.keys(responses)
    .filter((c) => c !== 'default')
    .map((c) => Number(c))
    .filter((n) => Number.isFinite(n) && n >= 200 && n < 300)
    .sort((a, b) => a - b)
    .at(0)

  const response = responses[String(status)]

  if (!response) {
    return 'unknown'
  }

  if ('$ref' in response) {
    return 'unknown'
  }

  const schema = response.content?.['application/json']?.schema

  if (schema !== undefined && '$ref' in schema) {
    const componentName = getComponentNameFromRef(schema.$ref)

    if (!componentName) {
      return 'unknown'
    }

    const reference = context.references.get('valibot')?.get(componentName)

    if (!reference) {
      return 'unknown'
    }

    return `v.InferOutput<typeof schema.${reference.name}>`
  }

  return 'unknown'
}

function createSuccessMapper(context: HandlerContext, operation: Operation) {
  const responses = operation.responses

  if (!responses) {
    return null
  }

  const status = Object.keys(responses)
    .filter((c) => c !== 'default')
    .map((c) => Number(c))
    .filter((n) => Number.isFinite(n) && n >= 200 && n < 300)
    .sort((a, b) => a - b)
    .at(0)

  const response = responses[String(status)]

  if (!response || '$ref' in response) {
    return null
  }

  const schema = response.content?.['application/json']?.schema

  if (schema !== undefined && '$ref' in schema) {
    const componentName = getComponentNameFromRef(schema.$ref)

    if (!componentName) {
      return null
    }

    const reference = context.references.get('valibot')?.get(componentName)

    if (!reference) {
      return null
    }

    return `
      ${componentName} (data: v.InferInput<typeof schema.${reference.name}>) {
        return v.parse(schema.${reference.name}, data)
      }
    `
  }

  return null
}
