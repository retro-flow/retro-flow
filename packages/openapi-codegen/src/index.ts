import type { UserConfig } from '@hey-api/openapi-ts'

import { nestPlugin } from './nest-plugin'

export function defineConfig(config: UserConfig & { output?: string }) {
  return {
    input: config.input,
    output: {
      path: config.output ?? './scheme',
      fileName: {
        suffix: null,
        name: (name) => (name === 'valibot' ? 'scheme' : name),
      },
      postProcess: ['prettier'],
    },
    plugins: [
      nestPlugin(),
      {
        name: 'valibot',
        definitions: { name: '{{name}}' },
        responses: { enabled: false },
        requests: { enabled: false },
        '~resolvers': {
          string(context) {
            const { $, schema, symbols } = context

            if (schema.format === 'date-time') {
              context.nodes.base = () => {
                return $(symbols.v).attr('date').call()
              }
              context.nodes.format = () => {
                return $(symbols.v).attr('transform').call('(value) => value.toISOString()')
              }
            }
          },
        },
      },
    ],
  } as UserConfig
}
