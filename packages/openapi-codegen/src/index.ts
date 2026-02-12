import path from 'node:path'

import { program } from 'commander'
import { create as createMemFs } from 'mem-fs'
import { create as createEditor } from 'mem-fs-editor'
import type { OpenAPIV3 } from 'openapi-types'
import SwaggerParser from '@apidevtools/swagger-parser'

import { handler as barrelHandler } from './barrel-generator'
import { handler as nestHandler } from './nest-generator'
import type { HandlerContext, Reference } from './types'
import { handler as valibotHandler } from './valibot-generator'

async function main() {
  program
    // CLI
    .option('-s, --schema <string>')
    .option('-o, --output <string>')
    .parse()

  const options = program.opts<{ schema: string; output: string }>()

  const document = (await SwaggerParser.bundle(path.resolve(options.schema))) as OpenAPIV3.Document

  const store = createMemFs()
  const fs = createEditor(store)

  const references = new Map<string, Map<string, Reference>>()

  const context = {
    fs,
    document,
    config: {
      output: {
        path: options.output,
      },
    },
    references,
    generators: {
      valibot: {
        schemaSuffix: 'Schema',
        requestSchemaSuffix: 'RequestSchema',
        requestInterfaceSuffix: 'Request',
      },
      nest: {
        requestInterfaceSuffix: 'Request',
      },
    },
  } satisfies HandlerContext

  await valibotHandler(context)
  await nestHandler(context)
  await barrelHandler(context)

  await fs.commit()
}

main()
