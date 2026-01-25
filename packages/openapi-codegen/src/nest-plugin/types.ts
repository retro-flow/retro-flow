import type { DefinePlugin } from '@hey-api/openapi-ts'

export type NestPluginConfig = {
  name: 'nest-plugin'
}

export type NestPlugin = DefinePlugin<NestPluginConfig>
