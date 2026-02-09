import type { MemFsEditor, VinylMemFsEditorFile } from 'mem-fs-editor'
import type { OpenAPIV3 } from 'openapi-types'

export type Operation = OpenAPIV3.OperationObject
export type Document = OpenAPIV3.Document

export type DocumentSchema = OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
export type DocumentSchemaObject = OpenAPIV3.SchemaObject
export type DocumentNonArraySchemaObject = OpenAPIV3.NonArraySchemaObject
export type DocumentArraySchemaObject = OpenAPIV3.ArraySchemaObject

export const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const

export interface Config {
  output: {
    path: string
  }
}

export interface ResolverContext {}

export interface Generators {
  nest: {
    requestInterfaceSuffix: string
  }
  valibot: {
    schemaSuffix: string
    requestSchemaSuffix: string
    resolvers?: {
      string?: (context: ResolverContext) => string
      number?: (context: ResolverContext) => string
    }
  }
}

export interface HandlerContext {
  document: OpenAPIV3.Document
  fs: MemFsEditor<VinylMemFsEditorFile>
  config: Config
  references: Map<string, Map<string, Reference>>
  generators: Generators
}

export interface Reference {
  name: string
}
