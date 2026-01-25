import { definePluginConfig } from '@hey-api/openapi-ts'

import { handler } from './plugin'
import type { NestPlugin } from './types'

export const defaultConfig: NestPlugin['Config'] = {
  name: 'nest-plugin',
  config: {},
  handler,
  dependencies: ['valibot'],
}

export const nestPlugin = definePluginConfig(defaultConfig)
