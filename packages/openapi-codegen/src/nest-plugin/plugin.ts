import { $ } from '@hey-api/openapi-ts'

import * as c from './compiler'
import type { NestPlugin } from './types'

export const handler: NestPlugin['Handler'] = async (params) => {
  const { plugin } = params

  const controllers = new Map<string, Handler[]>()
  const factories = new Map<string, ResponseFactory>()

  plugin.forEach('operation', (event) => {
    const operation = event.operation
    const tag = getOperationTag(operation)

    if (!isHandlerMethod(operation.method)) {
      return
    }

    const handler: Handler = {
      name: operation.id,
      decorators: [
        {
          name: getRouterDecoratorName(operation.method),
          value: { type: 'literal', value: operation.path },
        },
      ],
      arguments: [],
      result: { type: 'unknown' },
    }

    if (operation.body) {
      const body = plugin.referenceSymbol({
        tool: 'valibot',
        resourceId: operation.body.schema.$ref,
      })

      if (body.node) {
        handler.decorators.push({
          name: 'i.ValibotRequest',
          value: { type: 'identifier', value: createSchemeNamespace(body.name) },
        })

        handler.arguments.push({
          name: 'body',
          decorator: { name: 'n.Body' },
          type: `v.InferOutput<typeof ${createSchemeNamespace(body.name)}>`,
        })
      }
    }

    if (operation.responses) {
      const successResponse = Object.entries(operation.responses).find(([code]) => {
        return isSuccessStatus(Number(code))
      })?.[1]

      if (successResponse) {
        const response = plugin.referenceSymbol({
          tool: 'valibot',
          resourceId: successResponse.schema.$ref,
        })

        if (response.node) {
          const schema = createSchemeNamespace(response.name)
          const name =
            String(response.meta?.path?.at(-1) ?? '')
              .split('_')
              .at(-1) ?? ''

          factories.set(name, {
            name,
            schema,
            type: `v.InferInput<typeof ${schema}>`,
          })

          handler.result = {
            type: `v.InferOutput<typeof ${schema}>`,
          }
        }
      }
    }

    const handlers = controllers.get(tag) ?? []

    controllers.set(tag, [...handlers, handler])
  })

  const result = [
    createNamespaceImport('v', 'valibot'),
    createNamespaceImport('n', '@nestjs/common'),
    createNamespaceImport('i', '@retro-flow/nest-common/valibot'),
    createNamespaceImport('s', './scheme'),
  ]

  const barrel = ['export * from "./controller"', 'export * as r from "./responses"']

  const responses = [createNamespaceImport('v', 'valibot'), createNamespaceImport('s', './scheme')]

  for (const [_, factory] of factories) {
    responses.push(c.createValidationFactory(factory.name, factory.type, factory.schema))
  }

  for (const [name, handlers] of controllers) {
    result.push(createController(toPascalCase(`${name}ControllerImpl`), handlers))
  }

  emitFile(plugin, './index', barrel.join('\n'))
  emitFile(plugin, './responses', responses.join('\n'))
  emitFile(plugin, './controller', result.join('\n'))
}

type HandlerMethod = 'get' | 'post' | 'patch' | 'delete' | 'put'

interface Decorator {
  name: string
  value?: {
    type: 'identifier' | 'literal'
    value: string
  }
}

interface FunctionArgument {
  decorator?: Decorator
  name: string
  type: string
}

interface HandlerResult {
  type: string
}

interface ResponseFactory {
  name: string
  type: string
  schema: string
}

interface Handler {
  name: string
  decorators: Decorator[]
  arguments: FunctionArgument[]
  result: HandlerResult
}

function getRouterDecoratorName(method: HandlerMethod) {
  switch (method) {
    case 'delete':
      return 'n.Delete'
    case 'get':
      return 'n.Get'
    case 'patch':
      return 'n.Patch'
    case 'post':
      return 'n.Post'
    case 'put':
      return 'n.Put'
    default:
      throw new Error()
  }
}

function isHandlerMethod(method: string): method is HandlerMethod {
  return ['get', 'post', 'patch', 'delete', 'put'].includes(method)
}

function isSuccessStatus(code: number) {
  return code >= 200 && code <= 399
}

function createController(name: string, handlers: Handler[]) {
  return `
    @n.Controller()
    export class ${name} {
      ${handlers.map((handler) => createHandler(handler)).join('\n')}
    }
  `
}

function createIdentifier(value: string) {
  return value
}

function createLiteral(value: string) {
  return `'${value}'`
}

function createDecorator(decorator: Decorator) {
  const param = (() => {
    if (!decorator.value) {
      return ''
    }

    switch (decorator.value.type) {
      case 'identifier':
        return createIdentifier(decorator.value.value)
      case 'literal':
        return createLiteral(decorator.value.value)
      default:
        throw new Error()
    }
  })()

  return `@${decorator.name}(${param})`
}

function createHandlerParam(param: FunctionArgument) {
  if (param.decorator) {
    return `${createDecorator(param.decorator)} ${param.name}: ${param.type}`
  }

  return `${param.name}: ${param.type}`
}

function createHandler(handler: Handler) {
  return `
    ${handler.decorators.map((decorator) => createDecorator(decorator)).join('\n')}
    private async _${handler.name}(${handler.arguments.map((param) => createHandlerParam(param)).join(', ')}): Promise<${handler.result.type}> {
      return this.${handler.name}(${handler.arguments.map((param) => param.name)})
    }

    async ${handler.name}(${handler.arguments.map((param) => createHandlerParam({ ...param, decorator: undefined })).join(', ')}): Promise<${handler.result.type}> {
      throw new Error('Not implemented')
    }
  `
}

function createNamespaceImport(namespace: string, source: string) {
  return `
    import * as ${namespace} from '${source}'
  `
}

function createSchemeNamespace(value: string) {
  return `s.${value}`
}

function getOperationTag(operation: { tags?: ReadonlyArray<string> }) {
  return operation.tags?.[0] ?? 'Default'
}

function toPascalCase(value: string) {
  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
  const parts = cleaned.split(' ').filter(Boolean)
  const result = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')

  return result
}

function emitFile(plugin: NestPlugin['Instance'], filePath: string, source: string) {
  const sourceNode = $(source)

  const fileSymbol = plugin.symbol(filePath, {
    getFilePath: () => filePath,
  })

  fileSymbol.setNode(sourceNode)
  plugin.node(sourceNode)

  return { fileSymbol, sourceNode }
}
