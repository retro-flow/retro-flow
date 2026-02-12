import path from 'node:path'

import { format } from './formatter'
import type { HandlerContext } from './types'

export async function handler(context: HandlerContext) {
  const barrelFile = await format(renderBarrelFile())

  context.fs.write(path.resolve(context.config.output.path, 'index.ts'), barrelFile)
}

function renderBarrelFile() {
  const lines = []

  lines.push('export * from "./schema"')
  lines.push('export * from "./controllers"')

  return lines.join('\n')
}
